#include <string>
#include <vector>
#include <map>
#include <tuple>
#include <optional>
#include <variant>

#include "weilsdk/error.h"
#include "weilsdk/utils.h"
#include "weilsdk/runtime.h"
#include "weilsdk/ledger.h"
#include "contract.hpp"

extern "C" int __new(size_t len, unsigned char _id) __attribute__((export_name("__new")));
extern "C" void __free(size_t ptr, size_t len) __attribute__((export_name("__free")));
extern "C" void init() __attribute__((export_name("init")));
extern "C" void method_kind_data() __attribute__((export_name("method_kind_data")));

extern "C" void deposit() __attribute__((export_name("deposit")));
extern "C" void submit_proof() __attribute__((export_name("submit_proof")));
extern "C" void release() __attribute__((export_name("release")));
extern "C" void log_event() __attribute__((export_name("log_event")));

extern "C" void get_status() __attribute__((export_name("get_status")));
extern "C" void get_logs() __attribute__((export_name("get_logs")));
extern "C" void get_bounty() __attribute__((export_name("get_bounty")));
extern "C" void get_proof() __attribute__((export_name("get_proof")));

escrow_ContractState escrow_instance;

extern "C" {

int __new(size_t len, unsigned char _id) {
    void *ptr = weilsdk::Runtime::allocate(len);
    return reinterpret_cast<int>(ptr);
}

void __free(size_t ptr, size_t len) {
    weilsdk::Runtime::deallocate(ptr, len);
}

void init() {

    escrow_ContractState new_instance;

    nlohmann::ordered_json j = new_instance;

    weilsdk::WeilValue wv;
    wv.new_with_state_and_ok_value(j.dump(),"null");

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void method_kind_data() {

    std::map<std::string,std::string> mapping;

    mapping["deposit"] = "mutate";
    mapping["submit_proof"] = "mutate";
    mapping["release"] = "mutate";
    mapping["log_event"] = "mutate";

    mapping["get_status"] = "query";
    mapping["get_logs"] = "query";
    mapping["get_bounty"] = "query";
    mapping["get_proof"] = "query";

    nlohmann::ordered_json j = mapping;

    weilsdk::Runtime::setResult(j.dump(),0);
}

void deposit() {

    auto p = weilsdk::Runtime::stateAndArgs();

    std::string raw_args = p.second;

    nlohmann::ordered_json j = nlohmann::ordered_json::parse(raw_args);

    if (j.is_discarded() || !j.contains("amount")) {

        weilsdk::MethodError me("deposit","invalid_args");

        weilsdk::Runtime::setResult(
            weilsdk::WeilError::MethodArgumentDeserializationError(me),
            1
        );

        return;
    }

    uint64_t amount = j["amount"];

    std::string stateString = p.first;

    nlohmann::ordered_json state_json =
        nlohmann::ordered_json::parse(stateString);

    from_json(state_json,escrow_instance);

    auto result = escrow_instance.deposit(amount);

    if(result.first){

        weilsdk::MethodError me("deposit",result.second);

        std::string err =
            weilsdk::WeilError::FunctionReturnedWithError(me);

        weilsdk::Runtime::setStateAndResult(
            std::variant<weilsdk::WeilValue,std::string>{err}
        );

        return;
    }

    nlohmann::ordered_json j2 = escrow_instance;

    weilsdk::WeilValue wv;
    wv.new_with_state_and_ok_value(j2.dump(),"null");

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void submit_proof() {

    auto p = weilsdk::Runtime::stateAndArgs();

    std::string raw_args = p.second;

    nlohmann::ordered_json j = nlohmann::ordered_json::parse(raw_args);

    if (j.is_discarded() ||
        !j.contains("scan_id") ||
        !j.contains("vulnerability") ||
        !j.contains("endpoint") ||
        !j.contains("severity") ||
        !j.contains("proof_hash") ||
        !j.contains("confidence")) {

        weilsdk::MethodError me("submit_proof","invalid_args");

        weilsdk::Runtime::setResult(
            weilsdk::WeilError::MethodArgumentDeserializationError(me),
            1
        );

        return;
    }

    std::string scan_id = j["scan_id"];
    std::string vulnerability = j["vulnerability"];
    std::string endpoint = j["endpoint"];
    std::string severity = j["severity"];
    std::string proof_hash = j["proof_hash"];
    double confidence = j["confidence"];

    std::string stateString = p.first;

    nlohmann::ordered_json state_json =
        nlohmann::ordered_json::parse(stateString);

    from_json(state_json,escrow_instance);

    auto result = escrow_instance.submit_proof(
        scan_id,
        vulnerability,
        endpoint,
        severity,
        proof_hash,
        confidence
    );

    if(result.first){

        weilsdk::MethodError me("submit_proof",result.second);

        std::string err =
            weilsdk::WeilError::FunctionReturnedWithError(me);

        weilsdk::Runtime::setStateAndResult(
            std::variant<weilsdk::WeilValue,std::string>{err}
        );

        return;
    }

    nlohmann::ordered_json j2 = escrow_instance;

    weilsdk::WeilValue wv;
    wv.new_with_state_and_ok_value(j2.dump(),"null");

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void release() {

    auto p = weilsdk::Runtime::stateAndArgs();

    std::string stateString = p.first;

    nlohmann::ordered_json j =
        nlohmann::ordered_json::parse(stateString);

    from_json(j,escrow_instance);

    auto result = escrow_instance.release();

    if(result.first){

        weilsdk::MethodError me("release",result.second);

        std::string err =
            weilsdk::WeilError::FunctionReturnedWithError(me);

        weilsdk::Runtime::setStateAndResult(
            std::variant<weilsdk::WeilValue,std::string>{err}
        );

        return;
    }

    nlohmann::ordered_json j2 = escrow_instance;

    weilsdk::WeilValue wv;
    wv.new_with_state_and_ok_value(j2.dump(),"null");

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void log_event() {

    auto p = weilsdk::Runtime::stateAndArgs();

    std::string raw_args = p.second;

    nlohmann::ordered_json j = nlohmann::ordered_json::parse(raw_args);

    if (j.is_discarded() || !j.contains("stage") || !j.contains("data")) {

        weilsdk::MethodError me("log_event","invalid_args");

        weilsdk::Runtime::setResult(
            weilsdk::WeilError::MethodArgumentDeserializationError(me),
            1
        );

        return;
    }

    std::string stage = j["stage"];
    std::string data = j["data"];

    std::string stateString = p.first;

    nlohmann::ordered_json state_json =
        nlohmann::ordered_json::parse(stateString);

    from_json(state_json,escrow_instance);

    auto result = escrow_instance.log_event(stage,data);

    if(result.first){

        weilsdk::MethodError me("log_event",result.second);

        std::string err =
            weilsdk::WeilError::FunctionReturnedWithError(me);

        weilsdk::Runtime::setStateAndResult(
            std::variant<weilsdk::WeilValue,std::string>{err}
        );

        return;
    }

    nlohmann::ordered_json j2 = escrow_instance;

    weilsdk::WeilValue wv;
    wv.new_with_state_and_ok_value(j2.dump(),result.second);

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void get_status(){

    std::string stateString = weilsdk::Runtime::state();

    nlohmann::ordered_json j =
        nlohmann::ordered_json::parse(stateString);

    from_json(j,escrow_instance);

    auto result = escrow_instance.get_status();

    if(!result.first){

        weilsdk::MethodError me("get_status",result.second);

        weilsdk::Runtime::setResult(
            weilsdk::WeilError::FunctionReturnedWithError(me),
            1
        );

        return;
    }

    nlohmann::ordered_json j2 = escrow_instance;

    weilsdk::WeilValue wv;

    wv.new_with_state_and_ok_value(j2.dump(),result.second);

    weilsdk::Runtime::setStateAndResult(
        std::variant<weilsdk::WeilValue,std::string>{wv}
    );
}

void get_logs(){

    std::string stateString = weilsdk::Runtime::state();

    nlohmann::ordered_json j =
        nlohmann::ordered_json::parse(stateString);

    from_json(j,escrow_instance);

    auto result = escrow_instance.get_logs();

    weilsdk::Runtime::setResult(result.second,0);
}

void get_bounty(){

    std::string stateString = weilsdk::Runtime::state();

    nlohmann::ordered_json j =
        nlohmann::ordered_json::parse(stateString);

    from_json(j,escrow_instance);

    auto result = escrow_instance.get_bounty();

    nlohmann::ordered_json j2 = result.second;

    weilsdk::Runtime::setResult(j2.dump(),0);
}

void get_proof(){

    std::string stateString = weilsdk::Runtime::state();

    nlohmann::ordered_json j =
        nlohmann::ordered_json::parse(stateString);

    from_json(j,escrow_instance);

    auto result = escrow_instance.get_proof();

    weilsdk::Runtime::setResult(result.second,0);
}

}