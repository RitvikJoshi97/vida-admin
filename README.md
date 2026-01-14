# vida-admin



## General Information (for Ritvik's own context)

Task:
Build a dashboard page that allows admins to manage employee suggestions more effectively, helping drive the engagement.

A regional director of health, safety and wellbeing at a client has been tasked with reducing rates of MSK (musculoskeletal) absence in the company. They've rolled out VIDA (a desk and wellbeing assessment tool) to help their HR/H&S teams achieve it. Now they need to ensure employees are reducing their risk based on suggestions made by VIDA

Core Requirements:
- View suggestions dashboard - Display all suggestions (VIDA-generated and admin-created).
- Update suggestion status - Mark suggestions as "pending," "in progress," "completed," or "dismissed"
- Create custom suggestions - Allow admins to add new recommendations for specific employees with category selection

Expectations:
- You can work entirely with in-memory data manipulation, set up a simple local database with a backend, or choose any approach in between.
- Clean, responsive user interface which works on desktop and mobile viewports.
- Consideration of the user experience for an admin who might be managing suggestions for dozens of employees

## Thought process

### Who is the user?
HR team 

### Who was the system 'sold' to (helpful to understand sales pitch) 
'regional director' - hints towards an experienced person. 



### Understanding the data:
Data received:
```JSON
{
  "employees": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479" - STRING UUID
      "name": "firstName lastName" - STRING made up of two or more STRINGS - ensure diversity standards met
      "department": "" - STRING, 
      "riskLevel": "high" - STRING "low"/"medium"/"high"
    },
  ],
  "suggestions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001", STRING UUID
      "employeeId": "f47ac10b-58cc-4372-a567-0e02b2c3d479", STRING UUID
      "type": "equipment" - STRING "equipment"/"exercise"/"behavioural"/"lifestyle"
      "description": "Replace standard peripherals with ergonomic keyboard and mouse to reduce wrist strain", STRING long
      "status": "pending" - STRING "in_progress"/"pending"/"completed"/"overdue"
      "priority": "high" - LOW/MEDIUM/HIGH
      "source": "vida" - STRING "vida"/"admin",
      "createdBy": email string, EMPTY/non-existant-row if VIDA, email string if made by an ADMIN
      "dateCreated": "2024-01-15T09:00:00Z"-  DATETIME
      "dateUpdated": "2024-01-15T09:00:00Z" - DATETIME
      "dateCompleted": "2024-01-15T14:00:00Z", DATETIME OPTIONAL, only required if status="completed"
      "notes": "" 
    }
  ]
}
```



## Design
KISS principle applied:

Design 

Login page
Loader 
Main admin page



### Colour Pallete
Core neutrals (layout + cards)
Page / card base: #FFFFFF
Warm off-white section tint: #F9F8F4
Soft mint tint (sub-panels): #EDF5EF
Very light lavender tint (some cards): #EFF0FE
Very light cyan tint (some cards): #DDF0FB
Borders / dividers: #DBDFDF
Muted gray: #AEB4B2

Navigation + primary brand (sidebar)
Sidebar background (deep teal): #033435 (also shows as #043436)
Sidebar secondary dark: #324746
Primary accents (CTAs, highlights, charts)
Teal CTA / active state: #015B55
Teal variant (icons/lines): #2F7279
Success green (charts, positive): #2BBA7E
Warning / “moderate” amber: #F4BF73
Magenta (score bar / emphasis): #B62372
Purple accent (small chart slice): #7C41AD (sometimes closer to #AB2EAC)
Link/utility blue (small UI elements): #4188E3

Text
Primary text (near-black charcoal): around #222323 / #303138
Secondary text (muted slate): #697C7F
Optional: logo accent tones (top-left mark)
Red: #B3071A
Orange: #DB972B
Teal: #4DC0BD
