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


### Who is the user?
HR team

### Who was the system 'sold' to (helpful to understand sales pitch) 
'regional director'



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


## What are KPIs/items that can be used to measure 'ensure employees are reducing their risk based on suggestions made by VIDA'

This is the most important part of any dashboard - what's the most important for the business? What is the utmost necessary?

## Related to 'Adoption' and 'Follow through'
### Suggestion completion rate

'if high-risk employees aren’t completing, risk won’t fall.':
How much of the recommended plan actually gets done.
- Overall completion rate = completed / total suggestions
- Completion rate by risk level (high/medium/low) = completed where employee.riskLevel=high / total where employee.riskLevel=high
- Completion rate by type (equipment/exercise/behavioural/lifestyle) = completed where type=equipment / total where type=equipment


### Time-to-action (speed)
'How much time does it take':
Whether people act quickly after VIDA identifies risk.
- Median time to start (if you treat in_progress as “started”) = median(dateUpdated - dateCreated) for status in {"in_progress","completed"}
- Median time to complete = median(dateCompleted - dateCreated) for status="completed"
- % completed within SLA (you define SLAs by priority)
  Example SLA: High=7 days, Medium=14, Low=30
  % = completed within SLA / completed

Why it matters: fast action reduces prolonged exposure and shows engagement.

### Overdue burden (friction / risk persistence)

Overdue items are where risk remains unmitigated:

How much unresolved risk is hanging around.
- Overdue rate = overdue / total
- Overdue rate (high priority) = overdue where priority=high / total where priority=high
- Overdue backlog per 100 employees = (count(overdue) / employee_count) * 100

### Engagement depth (per-employee follow-through)
MSK reduction is about fully addressing key risks, not partial completion:
This stops a situation where “we completed a few easy ones” but high-risk users still have many open actions.

For each employee:
Open actions = count(status in {"pending","in_progress","overdue"})
Completion ratio = completed / total for that employee

Average priority-weighted completion
Assign weights (High=3, Medium=2, Low=1):
sum(weight(priority) for completed) / sum(weight(priority) for all)

Then track:
% of high-risk employees with 0 overdue items
% of high-risk employees with all high-priority items completed

## Related to 'Adoption' and 'Follow through'
Suggestion mix and coverage
Admin overrides
Reopen/churn rate

### Operational metrics (to run the program well)
Department hotspots:
- Overdue per department
- High-risk share per department
- Completion rate per department
- Median time-to-complete per department

This lets leaders target teams needing more support (budget, equipment procurement, manager coaching).


## What are 'subtly important' features that are important to the user
### Understanding the company's subscription and what they're missing out by not taking the more premium feature
- 'number of employees who have signed up' 
- 'plans that the employees are on'

### Reliability metrics of VIDA 
- SLA

### Export data and API
- necessary dashboard items export (for presentations etc)
- full data export
- partial data export

- Full API integration

### Data Privacy
- RBAC
- Row-level security 
- Add/Remove admins
- Augit logs
- Data retention control (access 'acceptance' of people who have agreed to use the VIDA application)

### Notification and reporting automation Centre
- 'Report me these metrics to my mail every week'
- Threshold alert - 'overdie high priority'

## Design
KISS principle applied

Design - Keep it similar to the VIDA page.

Login page
Loader 
Admin page
 - Dashboard
 - Suggestions Page
 - Settings


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

FontType: Roboto

### Navigation / structure

Sidebar:
- Dark teal sidebar with:
- Brand mark at top (check 'ritvikDesignLogo.svg' in the public folder)
- Grouped nav (“TEAM” / “PERSONAL”)

Simple line icons:
- Active/selected state uses brighter teal and/or a subtle highlight.
- Top bar / utilities
- Top-right icons: bell (notifications) + avatar/profile.
- These are minimal and unobtrusive.

Cards & surfaces:
- Cards are white on an off-white background.
- Rounded corners (feels like ~12–16px radius).
- Subtle borders (#DBDFDF range) and very soft shadows (or sometimes no shadow + border).

Buttons & controls:
Buttons are pill-shaped / rounded.

Visual style:
- Some look like outlined pills with teal border + teal text (“Send invites”).
- Some are more link-like (“Assess yourself”) with lighter emphasis.
- There’s a consistent “low aggression” CTA approach — nothing screams “click me now.”
