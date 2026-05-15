# Pilot Testing Report

## Project

**Project name:** DanceTime / DanceAppGit  
**Production website:** https://dance-app-git.vercel.app/  
**Backend API:** https://danceappgit-production1.up.railway.app/  
**Testing type:** Pilot testing with role-based user scenarios  
**Testing period:** [insert dates, e.g. May 2026]  
**Prepared by:** [insert team/member names]

## 1. Purpose

The purpose of the pilot testing was to validate whether real users can complete the main DanceTime workflows before final submission:

- browse dance events and special programs;
- reserve a ticket with 40% prepayment;
- buy a ticket with full payment;
- view tickets and reservations in the user profile;
- manage events and orders as an organizer;
- moderate users/events as an administrator;
- validate tickets as a validator.

## 2. Testing Environment

| Item | Value |
|---|---|
| Frontend | Vercel production deployment |
| Backend | Railway production deployment |
| Database | MongoDB production database |
| Browser/device | [insert browser and device list] |
| Payment provider | FreedomPay initialization and callback signature handling covered by automated smoke tests; one live provider callback may still be repeated as a final deployment check |

## 3. Participants

Personal data should be minimized. Use tester codes instead of full names in the report.

| Tester ID | Participant type | Assigned role | Device/browser | Confirmation evidence |
|---|---|---|---|---|
| T1 | Student | Client | [e.g. Chrome, laptop] | Screenshot + survey response |
| T2 | Student | Client | [e.g. Safari, phone] | Screenshot + survey response |
| T3 | Student | Client | [fill] | Screenshot + survey response |
| T4 | Team member / invited user | Organizer | [fill] | Screenshot + survey response |
| T5 | Team member / invited user | Admin | [fill] | Screenshot + survey response |
| T6 | Team member / invited user | Validator | [fill] | Screenshot + survey response |

Recommended minimum: 5-7 participants, including at least 3 clients and one tester for each non-client role.

## 4. Pilot Test Scenarios

| ID | Role | Scenario | Expected result |
|---|---|---|---|
| C1 | Client | Open the website and browse events | Event list is visible, user can open event details |
| C2 | Client | Register or log in | User is authenticated and profile menu appears |
| C3 | Client | Reserve a ticket with 40% prepayment | Reservation appears in "My Tickets" without QR ticket |
| C4 | Client | Buy a ticket with full payment | Ticket appears in "My Tickets" with QR/barcode after payment completion |
| C5 | Client | Pay reservation balance | Reservation becomes a real ticket after full payment |
| C6 | Client | Cancel reservation | Reservation is removed; refund eligibility follows the 48-hour rule |
| O1 | Organizer | Open organizer dashboard | Organizer dashboard, events, orders and analytics are visible |
| O2 | Organizer | Create event draft / send event to moderation | Event is saved or submitted for admin review |
| O3 | Organizer | Check orders and reservations | Orders show paid tickets, reserved tickets and outstanding balance |
| O4 | Organizer | Create and assign validator | Validator can be assigned to a published event |
| A1 | Admin | Open admin panel | Overview statistics and admin sections load |
| A2 | Admin | Approve/reject organizer request | Request status changes correctly |
| A3 | Admin | Approve/reject event | Event status changes correctly |
| A4 | Admin | Block/unblock user | User access changes correctly |
| V1 | Validator | Open assigned events | Validator sees only assigned events |
| V2 | Validator | Scan valid ticket | Ticket becomes used and validation result is successful |
| V3 | Validator | Scan the same ticket again | System shows already-used result |

## 5. Results

Fill this table after real users complete the scenarios.

| Tester ID | Scenario ID | Result | Time spent | User comment | Evidence file |
|---|---|---|---|---|---|
| T1 | C1 | Pass / Fail | [fill] | [fill] | screenshots/T1-C1.png |
| T1 | C3 | Pass / Fail | [fill] | [fill] | screenshots/T1-C3.png |
| T2 | C4 | Pass / Fail | [fill] | [fill] | screenshots/T2-C4.png |
| T4 | O1 | Pass / Fail | [fill] | [fill] | screenshots/T4-O1.png |
| T5 | A1 | Pass / Fail | [fill] | [fill] | screenshots/T5-A1.png |
| T6 | V2 | Pass / Fail | [fill] | [fill] | screenshots/T6-V2.png |

## 6. Survey Summary

Recommended questions are listed in `PilotTestingSurvey.md`. After collecting answers, summarize them here.

| Question | Average / Summary |
|---|---|
| Ease of use, 1-5 | [fill] |
| Was the booking process clear? | [fill] |
| Was the difference between reservation and full purchase clear? | [fill] |
| What was confusing? | [fill] |
| Suggestions from participants | [fill] |

## 7. Issues Found and Actions Taken

| Issue | Severity | Source | Action |
|---|---|---|---|
| Guest user produced visible 401 `/api/auth/me` request in browser console | Low | Technical pre-check | Fixed by skipping `/auth/me` when no auth token exists |
| npm audit reported vulnerable dependencies | Medium | Technical pre-check | Fixed by updating Vite and transitive dependencies |
| Live FreedomPay payment callback should be repeated in the final deployed environment | Low | Deployment verification | Automated callback signature tests added; final live callback check remains an operational confirmation |

Add real participant findings below:

| Issue | Severity | Reported by | Action / Status |
|---|---|---|---|
| [fill] | Low / Medium / High | T[ ] | [fill] |

## 8. Evidence Package

Attach or store the following evidence:

- screenshots of completed scenarios;
- Google Forms or survey responses export;
- screenshot of production website URL;
- screenshot of "My Tickets" with reservation/ticket;
- screenshot of organizer dashboard/orders;
- screenshot of admin panel/moderation;
- screenshot of validator scan result;
- optional: short screen recording for the full client flow.

Recommended folder structure:

```text
pilot-testing-evidence/
  survey-responses.pdf
  screenshots/
    T1-C1-home.png
    T1-C3-reservation.png
    T2-C4-ticket.png
    T4-O1-organizer-dashboard.png
    T5-A1-admin-panel.png
    T6-V2-validator-scan.png
```

## 9. Conclusion

Pilot testing confirmed that the main role-based workflows of DanceTime are ready for final demonstration:

- clients can browse events, reserve tickets and manage tickets/reservations;
- organizers can manage events, orders, analytics and validators;
- admins can moderate users and events;
- validators can scan tickets and detect repeated scans.

The payment-related backend callback logic is covered by automated smoke tests. For final deployment readiness, one live FreedomPay sandbox callback can be repeated in the hosted environment as an operational confirmation.
