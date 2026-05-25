"""
Run once on VPS to create nhanvo user and seed job data.

Usage:
    source venv/bin/activate
    python seed_jobtracker.py
"""
import asyncio
import bcrypt
from database import create_jobtracker_user, get_jobtracker_user, set_jobtracker_jobs

NHANVO_JOBS = [
    {"title": "Executive - Accounting & Tax Service", "url": "https://www.linkedin.com/jobs/view/4158026537/", "company": "TMF Group", "loc": "HCM", "mode": "Hybrid", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Senior Associate - Accounting Services", "url": "https://www.linkedin.com/jobs/view/4413530565/", "company": "PwC", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Supply Chain Management Accountant Specialist", "url": "https://www.linkedin.com/jobs/view/4408626069/", "company": "Vinamilk", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Senior Financial Analyst", "url": "https://www.linkedin.com/jobs/view/4401182332/", "company": "Viet Thai International - VTI Group", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Assistant Manager Accounting & Finance", "url": "https://www.linkedin.com/jobs/view/4398113287/", "company": "Morrison Express", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Senior Specialist – Price Appraisal (Finance Business Partnering Division)", "url": "https://www.linkedin.com/jobs/view/4412617394/", "company": "PNJ Group", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "downloaded"},
    {"title": "HO - Senior Data Analytics (HR Domain)", "url": "https://www.linkedin.com/jobs/view/4408993863/", "company": "ACB - Asia Commercial Bank", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "viewed"},
    {"title": "Senior Financial Accountant", "url": "https://www.linkedin.com/jobs/view/4409376545/", "company": "KingBee", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Finance & Accounting Staff (2-3 years in Retail/supermarket)", "url": "https://www.linkedin.com/jobs/view/4408626173/", "company": "Mapple Mitra Adiperkasa Vietnam", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "downloaded"},
    {"title": "Data Analyst (FA Team)", "url": "https://www.linkedin.com/jobs/view/4412655677/", "company": "Ahamove", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "downloaded"},
    {"title": "Senior General Accountant", "url": "https://www.linkedin.com/jobs/view/4406059177/", "company": "Money Forward Vietnam", "loc": "HCM", "mode": "Hybrid", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Financial Analyst", "url": "https://www.linkedin.com/jobs/view/4412622796/", "company": "KFC Vietnam", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "downloaded"},
    {"title": "Consultant Finance Services", "url": "https://www.linkedin.com/jobs/view/4406033673/", "company": "VISTRA", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Finance Controlling Assistant Manager", "url": "https://www.linkedin.com/jobs/view/4397211900/", "company": "Beiersdorf", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Deputy Finance Controller", "url": "https://www.linkedin.com/jobs/view/4401699407/", "company": "TOA Paint VietNam", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Senior Accountant (Accounting Review)", "url": "https://www.linkedin.com/jobs/view/4383535731/", "company": "Forvis Mazars in Vietnam", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "viewed"},
    {"title": "Senior Data Analyst", "url": "https://www.linkedin.com/jobs/view/4409755215/", "company": "Golden Gate Restaurant Group", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Accountant", "url": "https://www.linkedin.com/jobs/view/4405302715/", "company": "POP MART", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Accounting Specialist", "url": "https://www.linkedin.com/jobs/view/4406930446/", "company": "Saigon Marina IFC", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Accounts Payable Accountant", "url": "https://www.linkedin.com/jobs/view/4406446314/", "company": "Caldic", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Senior Accountant - Fixed Asset and Spare Part", "url": "https://www.linkedin.com/jobs/view/4394457420/", "company": "Suntory PepsiCo Vietnam Beverage", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Governance & Master Data Management Supervisor", "url": "https://www.linkedin.com/jobs/view/4402351379/", "company": "AB InBev Southeast Asia", "loc": "HCM", "mode": "On-site", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Senior Financial Analyst", "url": "https://www.linkedin.com/jobs/view/4403291903/", "company": "Techtronic Industries - TTI", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Supply Chain Management Accountant Specialist", "url": "https://www.linkedin.com/jobs/view/4400717216/", "company": "Vinamilk", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Analyst (Remote)", "url": "https://www.linkedin.com/jobs/view/4409183914/", "company": "APAC", "loc": "Vietnam", "mode": "Remote", "month": 5, "year": 2026, "status": "applied"},
    {"title": "Assistant Manager Accounting Services", "url": "https://www.linkedin.com/jobs/view/4396460346/", "company": "VISTRA", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Analyst - Workforce Management", "url": "https://www.linkedin.com/jobs/view/4406950058/", "company": "transcosmos Vietnam", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "General Admin Executive (Data/Reporting)", "url": "https://www.linkedin.com/jobs/view/4401695776/", "company": "MoMo (M_Service)", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Finance Business Partner Senior Specialist (Agriculture)", "url": "https://www.linkedin.com/jobs/view/4404538644/", "company": "Betrimex Vietnam", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Senior Site Planner/ Data Analyst", "url": "https://www.linkedin.com/jobs/view/4378907387/", "company": "Highlands Coffee®", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Reporting Accountant", "url": "https://www.linkedin.com/jobs/view/4401072003/", "company": "Abbott Laboratories", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Finance Manager (Vietnamese)", "url": "https://www.linkedin.com/jobs/view/4404036363/", "company": "VGreen", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Senior Data Analyst", "url": "https://www.linkedin.com/jobs/view/4404293495/", "company": "ZZP", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "downloaded"},
    {"title": "Data Analyst", "url": "https://www.linkedin.com/jobs/view/4401858870/", "company": "AGAPI", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Commercial Business Analyst", "url": "https://www.linkedin.com/jobs/view/4404535422/", "company": "Luxasia", "loc": "HCM", "mode": "Hybrid", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Finance System Partner (Reporting / NSPB)", "url": "https://www.linkedin.com/jobs/view/4405313909/", "company": "Sunbytes", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "viewed"},
    {"title": "Site Analysis Executive", "url": "https://www.linkedin.com/jobs/view/4399707558/", "company": "Highlands Coffee®", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "FP&A Senior Analyst", "url": "https://www.linkedin.com/jobs/view/4402856672/", "company": "Highlands Coffee®", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Quality (Middle/Senior)", "url": "https://www.linkedin.com/jobs/view/4399743492/", "company": "Amaris Consulting", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "viewed"},
    {"title": "Operational Specialist", "url": "https://www.linkedin.com/jobs/view/4403909923/", "company": "Fintech Future Incorporation", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Financial Accountant", "url": "https://www.linkedin.com/jobs/view/4403936086/", "company": "We+ Asia", "loc": "HCM", "mode": "Hybrid", "month": 4, "year": 2026, "status": "applied"},
    {"title": "(Associate) Data Analyst", "url": "https://www.linkedin.com/jobs/view/4403999328/", "company": "Callaway Golf", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Financial Analyst", "url": "https://www.linkedin.com/jobs/view/4394789140/", "company": "Outsourced", "loc": "HCM", "mode": "Remote", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Product Analyst", "url": "https://www.linkedin.com/jobs/view/4404527146/", "company": "Kredivo Group", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Analyst", "url": "https://www.linkedin.com/jobs/view/4399154137/", "company": "LF Global Tech", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "downloaded"},
    {"title": "Data Analyst", "url": "https://www.linkedin.com/jobs/view/4403344487/", "company": "Axon Active", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Financial Planning and Analysis Specialist", "url": "https://www.linkedin.com/jobs/view/4388301396/", "company": "GiaoHangNhanh (GHN)", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Data Analyst (Power BI)", "url": "https://www.linkedin.com/jobs/view/4401823883/", "company": "ADA", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
    {"title": "Senior Data Analyst (Banking Card & Loyalty)", "url": "https://www.linkedin.com/jobs/view/4398776284/", "company": "Galaxy Holdings", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "downloaded"},
    {"title": "Master Data Analyst", "url": "https://www.linkedin.com/jobs/view/4391133646/", "company": "Publicis Re:Sources", "loc": "HCM", "mode": "Hybrid", "month": 4, "year": 2026, "status": "viewed"},
    {"title": "Senior Finance Analyst", "url": "https://www.linkedin.com/jobs/view/4397675655/", "company": "Got It", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "downloaded"},
    {"title": "Branch Operations Analyst", "url": "https://www.linkedin.com/jobs/view/4371596145/", "company": "Diag Medical", "loc": "HCM", "mode": "On-site", "month": 4, "year": 2026, "status": "applied"},
]

async def main():
    password = input("Password cho user nhanvo: ")
    existing = await get_jobtracker_user("nhanvo")
    if existing:
        print("User nhanvo đã tồn tại, chỉ update jobs.")
    else:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        await create_jobtracker_user("nhanvo", hashed)
        print("Đã tạo user nhanvo.")

    await set_jobtracker_jobs("nhanvo", NHANVO_JOBS)
    print(f"Đã seed {len(NHANVO_JOBS)} jobs cho nhanvo.")

asyncio.run(main())
