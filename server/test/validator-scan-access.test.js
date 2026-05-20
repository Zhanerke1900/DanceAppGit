import assert from "node:assert/strict";
import test from "node:test";

import { getScanAccess } from "../src/services/ticket.service.js";

test("assigned validator can validate a ticket for the selected event", () => {
  const validator = {
    _id: "validator-1",
    email: "validator@example.com",
    role: "validator",
    validatorAssignedEventIds: ["event-1"],
  };

  const access = getScanAccess({
    currentUser: validator,
    ticketEventId: "event-1",
    ticketOrganizerId: "organizer-1",
    expectedEventId: "event-1",
  });

  assert.equal(access.canValidateTicket, true);
  assert.equal(access.canReportAnotherEvent, true);
});

test("assigned validator can report a ticket from another selected event", () => {
  const validator = {
    _id: "validator-1",
    email: "validator@example.com",
    role: "validator",
    validatorAssignedEventIds: ["selected-event"],
  };

  const access = getScanAccess({
    currentUser: validator,
    ticketEventId: "ticket-event",
    ticketOrganizerId: "organizer-1",
    expectedEventId: "selected-event",
  });

  assert.equal(access.canValidateTicket, false);
  assert.equal(access.canReportAnotherEvent, true);
});

test("validator cannot validate or inspect events they are not assigned to", () => {
  const validator = {
    _id: "validator-1",
    email: "validator@example.com",
    role: "validator",
    validatorAssignedEventIds: ["assigned-event"],
  };

  const access = getScanAccess({
    currentUser: validator,
    ticketEventId: "ticket-event",
    ticketOrganizerId: "organizer-1",
    expectedEventId: "selected-event",
  });

  assert.equal(access.canValidateTicket, false);
  assert.equal(access.canReportAnotherEvent, false);
});

test("organizer can validate tickets for their own event", () => {
  const organizer = {
    _id: "organizer-1",
    email: "organizer@example.com",
    role: "organizer",
  };

  const access = getScanAccess({
    currentUser: organizer,
    ticketEventId: "event-1",
    ticketOrganizerId: "organizer-1",
    expectedEventId: "",
  });

  assert.equal(access.canValidateTicket, true);
  assert.equal(access.canReportAnotherEvent, true);
});

test("admin role can validate and inspect tickets", () => {
  const admin = {
    _id: "admin-1",
    email: "admin@example.com",
    role: "admin",
  };

  const access = getScanAccess({
    currentUser: admin,
    ticketEventId: "ticket-event",
    ticketOrganizerId: "organizer-1",
    expectedEventId: "selected-event",
  });

  assert.equal(access.canValidateTicket, true);
  assert.equal(access.canReportAnotherEvent, true);
});
