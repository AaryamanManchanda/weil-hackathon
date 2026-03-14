import json
import os
import subprocess
import hashlib
from typing import TypedDict, Annotated, Sequence
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from backend import push_event
from security_tools import test_sql_injection_login

# Load environment variables (Make sure you have GOOGLE_API_KEY set)
load_dotenv()

CONTRACT_ADDRESS = "aaaaaaqey6suypclwh6wmvu4pjy52pcxhieusrqpjt43ytehnz32uqksvu"

def run_weil_command(command: str):
    """
    Runs a Weil CLI command through WSL and returns the output.
    """

    full_cmd = f"""
printf 'connect --host sentinel.weilliptic.ai
{command}
quit
' | weil
"""

    result = subprocess.run(
        [
            "wsl",
            "bash",
            "-c",
            f"export WC_PATH=/home/aaryaman/weil_wallet && {full_cmd}"
        ],
        capture_output=True,
        text=True
    )

    print("\n[WEILCHAIN RESPONSE]")
    print(result.stdout)

    return result.stdout

# ==========================================
# 1. DEFINE THE BLOCKCHAIN AUDIT HOOK
# ==========================================
def log_to_weilchain(step: str, event_data: dict):

    try:

        if step == "BOUNTY_TRIGGER":

            scan_id = "scan_001"

            proof_data = {
                "scan_id": scan_id,
                "vulnerability": event_data.get("vulnerability"),
                "endpoint": event_data.get("endpoint"),
                "severity": "High",
                "confidence": 0.99
            }

            proof_hash = hashlib.sha256(
                json.dumps(proof_data).encode()
            ).hexdigest()

            proof_data["proof_hash"] = proof_hash

            args = json.dumps(proof_data)

            command = f"execute --name {CONTRACT_ADDRESS} --method submit_proof --method-args '{args}'"

            result = run_weil_command(command)

            print(result)

            print("\n⛓️ Submitting vulnerability proof to Weilchain")
            push_event("Proof submitted to Weilchain")

            print("\n⏳ Waiting for proof verification before release")
            push_event("Waiting for proof verification")

            status_command = f"execute --name {CONTRACT_ADDRESS} --method get_status"

            status = run_weil_command(status_command)

            print(status)

            return "proof_submitted"

        else:

            log_payload = json.dumps({
                "stage": step,
                "data": event_data
            })

            command = f"execute --name {CONTRACT_ADDRESS} --method log_event --method-args '{log_payload}'"

            result = run_weil_command(command)

            print(result)

            print(f"\n⛓️ Logging audit step: {step}")
            push_event(f"Blockchain audit log written: {step}")

            return "event_logged"

    except Exception as e:
        print(f"\n⚠️ Error in log_to_weilchain: {e}")
        return "error"

            
# ==========================================
# 2. DEFINE THE STATE & TOOLS
# ==========================================
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    scan_complete: bool
    vulnerability_found: bool
    proof: dict

@tool
def execute_sql_attack():
    """Executes the SQL injection tool against the target login endpoint."""
    print("\n[🛠️ TOOL RUNNING] Executing SQL Injection payloads...")
    push_event("Running SQL injection test")
    result = test_sql_injection_login()
    return json.dumps(result)

tools = [execute_sql_attack]

# Hooking up Gemini as the reasoning engine
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0).bind_tools(tools)

# ==========================================
# 3. DEFINE THE GRAPH NODES
# ==========================================
def reasoning_node(state: AgentState):
    """The AI decides what to do next based on the state."""
    print("\n[🧠 AI REASONING] Analyzing current state...")
    push_event("AI scan started")
    
    system_prompt = SystemMessage(content="""
    You are an autonomous security auditor. Your job is to test the /login endpoint.
    1. First, use the `execute_sql_attack` tool to scan the target.
    2. Analyze the JSON output from the tool.
    3. If the status is "VULNERABLE", summarize the proof and finish.
    """)
    
    messages = [system_prompt] + list(state["messages"])
    response = llm.invoke(messages)
    
    return {"messages": [response]}

def tool_node(state: AgentState):
    """Executes the tool if the LLM requested it."""
    last_message = state["messages"][-1]
    
    tool_calls = getattr(last_message, "tool_calls", [])
    if not tool_calls:
        return state
        
    tool_call = tool_calls[0]
    
    # Run the actual tool you built in security_tools.py
    tool_result = execute_sql_attack.invoke(tool_call["args"])
    
    # Parse the result to update our deterministic state
    result_dict = json.loads(tool_result)
    is_vulnerable = result_dict.get("status") == "VULNERABLE"
    
    # Log the tool execution to the blockchain
    log_to_weilchain("TOOL_EXECUTION", {
        "action": "sql_injection_test",
        "result": result_dict
    })
    
    tool_msg = ToolMessage(
        content=tool_result,
        name=tool_call["name"],
        tool_call_id=tool_call["id"]
    )
    
    return {
        "messages": [tool_msg],
        "scan_complete": True,
        "vulnerability_found": is_vulnerable,
        "proof": result_dict if is_vulnerable else {}
    }

def audit_node(state: AgentState):
    """Logs the final proof to trigger the WUSD payout."""

    if state.get("vulnerability_found"):

        print("\n[🚨 VULNERABILITY CONFIRMED] Generating immutable proof...")

        proof = state.get("proof", {})
        push_event("Vulnerability detected")

        log_to_weilchain("BOUNTY_TRIGGER", proof)

    else:

        print("\n[✅ SYSTEM SECURE] No vulnerabilities found.")

        log_to_weilchain("SCAN_COMPLETE", {"status": "secure"})

    return state

# 4. DEFINE THE CONTROL LOGIC (EDGES)

def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    
    # If LLM called a tool, go to the tool node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "execute_tool"
        
    # If the scan is complete, go to the audit node
    if state.get("scan_complete"):
        return "audit_log"
        
    return "end"

# 5. BUILD AND COMPILE THE GRAPH

workflow = StateGraph(AgentState)

workflow.add_node("reason", reasoning_node)
workflow.add_node("execute_tool", tool_node)
workflow.add_node("audit_log", audit_node)

workflow.add_edge(START, "reason")
workflow.add_conditional_edges("reason", should_continue, {
    "execute_tool": "execute_tool",
    "audit_log": "audit_log",
    "end": END
})
workflow.add_edge("execute_tool", "reason") # Loop back to LLM to read the tool output
workflow.add_edge("audit_log", END)

app = workflow.compile()


# 6. RUN THE AGENT

if __name__ == "__main__":

    push_event("System initialized")
    print("\n--- TESTING BLOCKCHAIN CONNECTION ---")

    log_to_weilchain(
        "TEST_EVENT",
        {
            "message": "AI agent blockchain test",
            "timestamp": "test_run"
        }
    )

    print("\n--- TEST COMPLETE ---")
    push_event("Starting agentic security scan")

    print("\n STARTING AGENTIC SECURITY SCAN...")
    
    initial_state = {
        "messages": [HumanMessage(content="Initiate security audit on the local Flask store.")],
        "scan_complete": False,
        "vulnerability_found": False,
        "proof": {}
    }
    
    # Stream the graph execution
    for output in app.stream(initial_state):
        pass
    
    print("\n SCAN COMPLETE.")