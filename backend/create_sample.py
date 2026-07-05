from fpdf2 import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Helvetica", size=12)

content = """PUMP P-101 MAINTENANCE MANUAL
Equipment: Centrifugal Pump P-101
Location: Plant A, Unit 3
Last Updated: January 2026

MAINTENANCE SCHEDULE:
- Daily: Check motor temperature and vibration levels
- Weekly: Inspect mechanical seals and bearings
- Monthly: Lubricate bearings with grease type SAE 30
- Quarterly: Replace mechanical seals if worn
- Annually: Full inspection of all components

COMMON FAILURES:
1. Bearing failure - caused by lack of lubrication
   Solution: Lubricate every 30 days
2. Seal leakage - caused by wear or misalignment
   Solution: Replace seals every 6 months
3. Cavitation - caused by low suction pressure
   Solution: Check inlet valve and strainer

SAFETY PROCEDURES:
- Always isolate power before maintenance
- Use lockout tagout procedure
- Wear PPE including gloves and safety glasses
- Never operate pump without guards in place

SPECIFICATIONS:
- Flow Rate: 500 LPH
- Pressure: 10 bar
- Motor Power: 5 kW
- RPM: 1450"""

for line in content.split('\n'):
    pdf.cell(0, 8, txt=line, ln=True)

pdf.output("pump_P101_manual.pdf")
print("Sample PDF created successfully!")