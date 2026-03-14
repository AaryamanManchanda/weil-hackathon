import json
import hashlib
import os
import requests as http_requests

# Mock WeilChain Agent SDK

class AgentContext:
    def __init__(self, wallet_path):
        self.wallet_path = wallet_path
        self.address = "ebf5e858909648af6ebc5270ba794569d9146b92081f7428b8acf3cac2e97ce4"
        self.signature = "mock_signature_valid"
        self.tx_history = []

    def _push_event(self, message: str, event_type="agent_event", payload=None, **kwargs):
        try:
            scan_id = os.environ.get("SCAN_ID", "scan_001")
            data = {
                "scan_id": scan_id,
                "message": message,
                "event_type": event_type,
                "payload": payload or {},
                **kwargs
            }
            http_requests.post("http://localhost:8000/push_event", json=data, timeout=2)
        except Exception:
            pass  # Dashboard not running

    def audit(self, payload):
        stage = payload.get("stage", "AGENT_ACTION")
        print(f"\n[?? WEIL_SDK AUDIT] Local Signing Agent: {self.address}")
        print(json.dumps(payload, indent=2))
        self.tx_history.append(payload)

        # Notify dashboard based on stage
        if stage == "proof_generated":
            proof_hash = payload.get("proof_hash", "0x...")
            self._push_event("Proof submitted to Weilchain via SDK", event_type="audit_log", stage="PROOF_SUBMITTED", status="proof_submitted", contract_status="Proof Submitted", proof_hash=proof_hash)
            
            print("\n? SDK: Auto-verifying proof on local node...")
            self._push_event("Waiting for proof verification", event_type="audit_log", stage="VERIFICATION", status="verified", contract_status="Verified")

        elif stage == "bounty_release_attempt":
            self.push_event(f"Requesting contract payout: {payload.get('contract')}")

        else:
            # Generic Audit notification
            self._push_event(f"Blockchain SDK log written: {stage}", event_type="audit_log", stage=stage)

    def push_event(self, message: str, event_type="agent_event", payload=None, **kwargs):
        self._push_event(message, event_type, payload, **kwargs)

# Provide a global instance
global_agent = AgentContext("")

# Provide decorator
def agent_decorator(wallet_path="/home/aaryaman/weil_wallet/account.wc"):
    def decorator(func):
        global global_agent
        global_agent = AgentContext(wallet_path)
        return func
    return decorator

# Trick Python into allowing both weil_ai.agent({...}) AND @weil_ai.agent(wallet_path=...)
class WeilAIProxy:
    @property
    def agent(self):
        # We return a callable object that acts as a decorator,
        # but also has .audit() attached to it!
        class AgentCallable:
            def __call__(self, wallet_path):
                return agent_decorator(wallet_path)
            
            def audit(self, payload):
                global_agent.audit(payload)

            @property
            def address(self): return global_agent.address
            
            @property
            def signature(self): return global_agent.signature
            
            @property
            def tx_history(self): return global_agent.tx_history
            
            def push_event(self, *args, **kwargs):
                global_agent.push_event(*args, **kwargs)
                
        return AgentCallable()

import sys
sys.modules[__name__] = WeilAIProxy()
