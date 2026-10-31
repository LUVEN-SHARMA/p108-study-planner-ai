import subprocess
from make_deliverables import AcademicPDF

def build_declaration_pdf():
    pdf = AcademicPDF("LMS_Submission_Files/Ethical_Compliance_Declaration_Luven_Sharma.pdf", title="Ethical Compliance Declaration - Project 77")
    
    pdf.new_page(is_cover=True)
    # Border frame
    pdf.current_stream.append("q 0.1 0.22 0.45 RG 1.5 w 35 35 525 770 re S Q")
    pdf.current_stream.append("q 0.98 0.94 0.90 rg 38 725 519 75 re f Q")
    pdf.current_stream.append("q 0.85 0.50 0.10 rg 38 725 6 75 re f Q")
    
    pdf.current_stream.append("BT /F2 13.5 Tf 0.7 0.3 0.05 rg 55 770 Td (HCLTech Career Shaper Programme) Tj ET")
    pdf.current_stream.append("BT /F1 10.0 Tf 0.25 0.35 0.50 rg 55 752 Td (Academic Year 2025-26 | III Year Industry Project) Tj ET")
    pdf.current_stream.append("BT /F2 9.0 Tf 0.1 0.2 0.4 rg 55 736 Td (ETHICAL COMPLIANCE & RESPONSIBLE AI USE DECLARATION) Tj ET")
    
    pdf.current_y = 660
    pdf.add_title("Ethical Compliance Declaration")
    pdf.add_h2("Mandatory Student Declaration for Agentic AI Task Planner with Tool Use")
    
    pdf.add_callout(
        "OFFICIAL HCLTECH PROGRAMME ETHICAL MANDATE",
        "Agentic AI with tool access can cause irreversible actions. Implement human confirmation before file write/email send actions. Log all tool calls. Ensure execution runtime sandboxing and full operational accountability.",
        alert_type="warning"
    )
    
    pdf.add_h1("1. Candidate & Project Particulars")
    c_headers = ["Field", "Particulars"]
    c_rows = [
        ["Project Title", "Agentic AI Task Planner with Tool Use"],
        ["Project Number", "Project No. 77"],
        ["Domain & Track", "LLM / Python (Advanced Track)"],
        ["Learner / Candidate Name", "Luven Sharma"],
        ["Student Roll Number / Enrolment", "2201010077"],
        ["Academic Year & Semester", "2025-26 | VI / VII Semester (III Year)"],
        ["Programme Mentor / Faculty", "Shaily Gaur (gaur-shaily@hcltech.com) & Coordinator"],
        ["Submission Checkpoint", "Week 4 Final Deliverables Submission"]
    ]
    pdf.add_table(c_headers, c_rows, [140, 355])
    
    pdf.add_h1("2. Formal Compliance Declarations")
    pdf.add_paragraph("I hereby solemnly declare and affirm that the Agentic AI Task Planner with Tool Use project adheres to the following rigorous ethical guidelines:")
    
    pdf.add_bullet("Human-in-the-Loop (HITL) Gate for Irreversible Actions", "All tools classified as state-modifying (specifically email_draft, file modifications, and non-idempotent api_call operations) are gated by mandatory human confirmation. The system halts execution and requires explicit human operator consent before dispatching.")
    pdf.add_bullet("100% Comprehensive Tool Call Logging", "Every tool invocation is permanently recorded in a structured, immutable audit log containing task_id, step index, timestamp, tool name, input arguments hash, human approval status, latency, and return status code.")
    pdf.add_bullet("Sandboxed & Isolated Runtime Execution", "The code_exec capability is strictly confined to an isolated execution sandbox preventing unauthorized host filesystem access, privilege escalation, or arbitrary external network connections.")
    pdf.add_bullet("Data Privacy & Security Safeguards", "No proprietary, sensitive, or personal data is transmitted to unauthorized third-party endpoints. All synthetic traces and evaluation logs comply with academic and industry data protection norms.")
    pdf.add_bullet("Academic Authenticity & Originality", "The implementation code, evaluation notebook, datasets, and project documentation represent my own individual intellectual output adhering to HCLTech's code of academic integrity.")
    
    pdf.add_h1("3. Signatures & Affirmation")
    pdf.add_paragraph("By signing below, I confirm that the project complies in full with the ethical, safety, and operational standards mandated by HCLTech and the Career Shaper Programme.")
    
    # Signature Box
    sig_y = 120
    pdf.current_stream.append(f"q 0.98 0.98 0.99 rg 50 {sig_y} 495 105 re f Q")
    pdf.current_stream.append(f"q 0.8 0.8 0.8 RG 1 w 50 {sig_y} 495 105 re S Q")
    
    pdf.current_stream.append(f"BT /F2 8.5 Tf 0.2 0.2 0.2 rg 65 {sig_y + 85} Td (Learner / Candidate Signature:) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 65 {sig_y + 65} Td (Signature: ______________________________________) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 65 {sig_y + 45} Td (Name: Luven Sharma      Date: ______________) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 65 {sig_y + 25} Td (Roll No: 2201010077   Place: ______________) Tj ET")
    
    pdf.current_stream.append(f"BT /F2 8.5 Tf 0.2 0.2 0.2 rg 320 {sig_y + 85} Td (Mentor / Faculty Endorsement:) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 320 {sig_y + 65} Td (Signature: ____________________________) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 320 {sig_y + 45} Td (Mentor Name: Shaily Gaur / Coordinator) Tj ET")
    pdf.current_stream.append(f"BT /F1 8.5 Tf 0.4 0.4 0.4 rg 320 {sig_y + 25} Td (Status: Approved & Validated) Tj ET")
    
    pdf.save()
    print("Generated LMS_Submission_Files/Ethical_Compliance_Declaration_Luven_Sharma.pdf")

build_declaration_pdf()
