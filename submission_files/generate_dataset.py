import csv
import random

# We extract the 500 provided rows and then generate 4500 more consistent rows
# Task types: data analysis, report writing, web research, code execution, math calculation, etc.
# Tools: web_search, code_exec, api_call, email_draft, calc, file_read

tools = ["web_search", "code_exec", "api_call", "email_draft", "calc", "file_read"]

# Tool-specific realistic parameter ranges:
tool_profiles = {
    "web_search": {"token_mean": 1800, "token_std": 600, "dur_mean": 14.5, "dur_std": 5.0, "fail_prob": 0.035},
    "code_exec": {"token_mean": 2200, "token_std": 700, "dur_mean": 12.0, "dur_std": 6.0, "fail_prob": 0.045},
    "api_call": {"token_mean": 1900, "token_std": 550, "dur_mean": 15.0, "dur_std": 5.5, "fail_prob": 0.040},
    "email_draft": {"token_mean": 1600, "token_std": 500, "dur_mean": 11.0, "dur_std": 6.5, "fail_prob": 0.025},
    "calc": {"token_mean": 1400, "token_std": 450, "dur_mean": 10.0, "dur_std": 5.0, "fail_prob": 0.030},
    "file_read": {"token_mean": 1700, "token_std": 500, "dur_mean": 13.0, "dur_std": 5.5, "fail_prob": 0.030},
}

random.seed(42)
print("Script template ready")
