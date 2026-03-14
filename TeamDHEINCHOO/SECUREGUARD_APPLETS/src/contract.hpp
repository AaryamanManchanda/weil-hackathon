#ifndef ESCROW_CONTRACT_HPP
#define ESCROW_CONTRACT_HPP

#include <vector>
#include <string>
#include <tuple>
#include <optional>
#include <algorithm>

template <typename T>
using Option = std::optional<T>;

template <typename T>
void to_json(nlohmann::ordered_json& j, const Option<T>& opt) {
    if (opt.has_value()) j = opt.value();
    else j = nullptr;
}

template <typename T>
void from_json(const nlohmann::ordered_json& j, Option<T>& opt) {
    if (j.is_null()) opt = std::nullopt;
    else opt = j.get<T>();
}

class escrow_ContractState {

private:

    // Escrow bounty
    uint64_t bounty = 0;

    bool proof_submitted = false;
    bool verified = false;
    bool released = false;

    // Full vulnerability proof
    std::string stored_scan_id;
    std::string stored_vulnerability;
    std::string stored_endpoint;

    std::string stored_severity;
    std::string stored_proof_hash;
    double stored_confidence = 0.0;

    // Agent audit logs
    std::vector<std::string> audit_logs;

public:

    escrow_ContractState() = default;

    // Company deposits bounty
    std::pair<bool,std::string> deposit(const uint64_t &amount) {

        if(amount == 0)
            return {true,"Amount must be greater than zero"};

        if(bounty > 0)
            return {true,"Bounty already deposited"};

        bounty = amount;

        audit_logs.push_back("company_deposit :: " + std::to_string(amount));

        return {false,""};
    }

    // AI submits vulnerability proof
    std::pair<bool,std::string> submit_proof(
        const std::string &scan_id,
        const std::string &vulnerability,
        const std::string &endpoint,
        const std::string &severity,
        const std::string &proof_hash,
        const double &confidence) {

        if(bounty == 0)
            return {true,"No bounty deposited"};

        stored_scan_id = scan_id;
        stored_vulnerability = vulnerability;
        stored_endpoint = endpoint;

        stored_severity = severity;
        stored_proof_hash = proof_hash;
        stored_confidence = confidence;

        proof_submitted = true;

        audit_logs.push_back("proof_submitted :: " + scan_id);

        if((severity == "High" || severity == "Critical") && confidence >= 0.8) {
            verified = true;
            audit_logs.push_back("proof_verified");
        }

        return {false,""};
    }

    // Release bounty to AI/security team
    std::pair<bool,std::string> release(){

        if(!verified)
            return {true,"Not verified"};

        if(released)
            return {true,"Already released"};

        released = true;

        audit_logs.push_back("bounty_released");

        return {false,""};
    }

    // Log AI agent events
    std::pair<bool,std::string> log_event(
        const std::string &stage,
        const std::string &data){

        std::string entry = stage + " :: " + data;

        audit_logs.push_back(entry);

        return {false,entry};
    }

    // Query contract status
    std::pair<bool,std::string> get_status(){

        if(released) return {true,"Released"};
        if(verified) return {true,"Verified"};
        if(proof_submitted) return {true,"Proof Submitted"};
        if(bounty > 0) return {true,"Bounty Deposited"};

        return {true,"Initialized"};
    }

    // Get AI audit logs
    std::pair<bool,std::string> get_logs(){

    nlohmann::ordered_json j = audit_logs;

    return {false, j.dump()};
    }

    // Get bounty amount
    std::pair<bool,uint64_t> get_bounty(){
        return {false,bounty};
    }

    // Get stored proof
    std::pair<bool,std::string> get_proof(){

        std::string proof =
            "scan:" + stored_scan_id +
            " vulnerability:" + stored_vulnerability +
            " endpoint:" + stored_endpoint +
            " severity:" + stored_severity +
            " hash:" + stored_proof_hash +
            " confidence:" + std::to_string(stored_confidence);

        return {false,proof};
    }

    friend void to_json(nlohmann::ordered_json &j, const escrow_ContractState &obj){

        j = nlohmann::ordered_json{

            {"bounty",obj.bounty},

            {"proof_submitted",obj.proof_submitted},
            {"verified",obj.verified},
            {"released",obj.released},

            {"stored_scan_id",obj.stored_scan_id},
            {"stored_vulnerability",obj.stored_vulnerability},
            {"stored_endpoint",obj.stored_endpoint},

            {"stored_severity",obj.stored_severity},
            {"stored_confidence",obj.stored_confidence},
            {"stored_proof_hash",obj.stored_proof_hash},

            {"audit_logs",obj.audit_logs}
        };
    }

    friend void from_json(const nlohmann::ordered_json &j, escrow_ContractState &obj){

        if(j.contains("bounty")) j.at("bounty").get_to(obj.bounty);

        if(j.contains("proof_submitted")) j.at("proof_submitted").get_to(obj.proof_submitted);
        if(j.contains("verified")) j.at("verified").get_to(obj.verified);
        if(j.contains("released")) j.at("released").get_to(obj.released);

        if(j.contains("stored_scan_id")) j.at("stored_scan_id").get_to(obj.stored_scan_id);
        if(j.contains("stored_vulnerability")) j.at("stored_vulnerability").get_to(obj.stored_vulnerability);
        if(j.contains("stored_endpoint")) j.at("stored_endpoint").get_to(obj.stored_endpoint);

        if(j.contains("stored_severity")) j.at("stored_severity").get_to(obj.stored_severity);
        if(j.contains("stored_confidence")) j.at("stored_confidence").get_to(obj.stored_confidence);
        if(j.contains("stored_proof_hash")) j.at("stored_proof_hash").get_to(obj.stored_proof_hash);

        if(j.contains("audit_logs")) j.at("audit_logs").get_to(obj.audit_logs);
    }

};

#endif