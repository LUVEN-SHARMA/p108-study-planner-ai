import re

# Update make_deliverables.py and generate_reports.py to use "Luven Sharma"
with open("submission_files/generate_reports.py", "r") as f:
    rep_code = f.read()

rep_code = rep_code.replace("[Learner to Fill Name]", "Luven Sharma")
rep_code = rep_code.replace("[Learner to fill in Name]", "Luven Sharma")
rep_code = rep_code.replace("[Learner to Fill Roll No]", "2201010077 / HCL-CSP-77")
rep_code = rep_code.replace("Learner Name", "Luven Sharma")
rep_code = rep_code.replace("submission_files/Project_Report.pdf", "LMS_Submission_Files/Agentic_AI_Task_Planner_Project_Report_Luven_Sharma.pdf")

with open("submission_files/generate_reports.py", "w") as f:
    f.write(rep_code)

# Update generate_eda_report.py
with open("submission_files/generate_eda_report.py", "r") as f:
    eda_code = f.read()

eda_code = eda_code.replace("submission_files/EDA_Analysis_Report.pdf", "LMS_Submission_Files/EDA_Analysis_Report_Luven_Sharma.pdf")
with open("submission_files/generate_eda_report.py", "w") as f:
    f.write(eda_code)

# Update generate_ethical_declaration.py
with open("submission_files/generate_ethical_declaration.py", "r") as f:
    eth_code = f.read()

eth_code = eth_code.replace("[Learner to Fill Name]", "Luven Sharma")
eth_code = eth_code.replace("[Learner Name]", "Luven Sharma")
eth_code = eth_code.replace("[Learner to Fill Roll No]", "2201010077")
eth_code = eth_code.replace("[Learner Roll No]", "2201010077")
eth_code = eth_code.replace("submission_files/Ethical_Compliance_Declaration.pdf", "LMS_Submission_Files/Ethical_Compliance_Declaration_Luven_Sharma.pdf")
with open("submission_files/generate_ethical_declaration.py", "w") as f:
    f.write(eth_code)

print("Updated script templates with Luven Sharma details.")
