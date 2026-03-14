import json
import os
import subprocess
import hashlib
from typing import TypedDict, Annotated, Sequence
import requests as http_requests
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from security_tools import test_sql_injection_login
import sys

# Ensure UTF-8 output to avoid Windows console errors
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables (Make sure you have GOOGLE_API_KEY set)
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

CONTRACT_ADDRESS = "aaaaaaqey6suypclwh6wmvu4pjy52pcxhieusrqpjt43ytehnz32uqksvu" 

def push_event(message: str, event_type="agent_event", payload=None, **kwargs):
    try:
        scan_id = os.environ.get("SCAN_ID", "scan_default")
        data = {
            "scan_id": scan_id,
            "message": message,
            "event_type": event_type,
            "payload": payload or {},
            **kwargs
        }
        http_requests.post("http://localhost:8000/push_event", json=data, timeout=2)
    except Exception as e:
        print(f"\n[PUSH_EVENT_ERROR] Failed to push: {e}")

def run_weil_command(command: str):
    """
    Runs a Weil CLI command through WSL and returns the output.
    """
    full_cmd = f'''
printf 'connect --host sentinel.weilliptic.ai
{command}
quit
' | weil
'''
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
            scan_id = os.environ.get("SCAN_ID", "scan_001")
            proof_data = {
                "scan_id": scan_id,
                "vulnerability": event_data.get("vulnerability", "SQL Injection"),
                "endpoint": event_data.get("endpoint", "/login"),
                "severity": "High",
                "confidence": 0.99
            }
            
            proof_hash = hashlib.sha256(
                json.dumps(proof_data).encode()
            ).hexdigest()
            proof_data["proof_hash"] = proof_hash

            args = json.dumps(proof_data).replace("'", "''")

            command = f"execute --name {CONTRACT_ADDRESS} --method submit_proof --method-args '{args}'"
            result = run_weil_command(command)
            
            print("\n[VULNERABILITY] Submitting vulnerability proof to Weilchain") 
            push_event("Proof submitted to Weilchain")

            print("\n[WAITING] Waiting for proof verification before release")       
            push_event("Waiting for proof verification")

            status_command = f"execute --name {CONTRACT_ADDRESS} --method get_status"
            status = run_weil_command(status_command)

            return "proof_submitted"
        else:
            log_payload = json.dumps({
                "stage": step,
                "data": event_data
            }).replace("'", "''")

            command = f"execute --name {CONTRACT_ADDRESS} --method log_event --method-args '{log_payload}'"
            result = run_weil_command(command)

            print(f"\n[AUDIT] Logging audit step: {step}")
            push_event(f"Blockchain audit log written: {step}")

            return "event_logged"
    except Exception as e:
        print(f"\n[ERROR] Error in log_to_weilchain: {e}")
        return "error"

# ==========================================
# 2. DEFINE THE STATE & TOOLS
# ==========================================
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    scan_complete: bool
    vulnerability_found: bool
    proof: dict

@tool
def execute_sql_attack():
    """Executes the SQL injection tool against the target login endpoint."""    
    print("\n[TOOL RUNNING] Executing SQL Injection payloads...") 
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
    print("\n[AI REASONING] Analyzing current state...")
    push_event("AI scan started")

    if os.environ.get("USE_GEMINI", "0") != "1":
        response = AIMessage(
            content="Deterministic mode enabled. Running SQL injection test.",
            tool_calls=[{
                "name": "execute_sql_attack",
                "args": {},
                "id": "call_deterministic_sql_attack"
            }]
        )
        return {"messages": [response]}

    system_prompt = SystemMessage(content='''
    You are an autonomous security auditor. Your job is to test the /login endpoint.
    1. First, use the execute_sql_attack tool to scan the target.
    2. Analyze the JSON output from the tool.
    3. If the status is "VULNERABLE", summarize the proof and finish.
    ''')

    messages = [system_prompt] + list(state["messages"])
    
    try:
        response = llm.invoke(messages)
    except BaseException as e:
        print(f"\n[AI ERROR] {e}. Falling back to deterministic scan mock.")
        push_event("AI API error (Rate Limit), failing over to secondary static scan")
        response = AIMessage(
            content="I am initiating the SQL injection scan on the local Flask store based on my rules.",
            tool_calls=[{
                "name": "execute_sql_attack",
                "args": {},
                "id": "call_mock12345"
            }]
        )

    if not getattr(response, "tool_calls", []):
        response = AIMessage(
            content="Proceeding with deterministic SQL injection test execution.",
            tool_calls=[{
                "name": "execute_sql_attack",
                "args": {},
                "id": "call_forced_sql_attack"
            }]
        )

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
        print("\n[VULNERABILITY CONFIRMED] Generating immutable proof...") 
        proof = state.get("proof", {})
        
        # We also trigger the UI explicitly so it sees the payload correctly
        push_event(
            "Vulnerability detected",
            event_type="vulnerability",
            payload={
                "scan_id": os.environ.get("SCAN_ID", "scan_default"),
                "vulnerability": "SQL Injection",
                "endpoint": "/login",
                "severity": "High",
                "confidence": 0.99,
                "payload": "' OR 1=1 -- "
            },
            status="vulnerable"
        )
        
        log_to_weilchain("BOUNTY_TRIGGER", proof)
    else:
        print("\n[SYSTEM SECURE] No vulnerabilities found.")
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
workflow.add_conditional_edges(
    "execute_tool",
    lambda s: "audit_log" if s.get("scan_complete") else "reason",
    {
        "audit_log": "audit_log",
        "reason": "reason",
    },
)
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

    push_event("Scan completed successfully", event_type="complete")
    print("\n SCAN COMPLETE.")
