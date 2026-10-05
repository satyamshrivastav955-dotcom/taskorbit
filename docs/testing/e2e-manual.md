# Manual end-to-end test

1. Login as client (seed output). Create project `Kulkarni Textiles ERP` with one requirement + file. Expect: appears in Client Overview with 0% progress.
2. Login as manager. Open Projects, open the new project, Add task: assign Rahul Deshmukh 01 Oct - 05 Oct, reviewer Kavya Reddy. Expect: task in table, no conflict dialog.
3. Add second task for Rahul overlapping 04 Oct - 08 Oct. Expect: dialog `Rahul Deshmukh already has ... Assign anyway?`. Click Assign anyway. Expect: both tasks show conflict badge; Conflicts page lists the pair with overlap 04 Oct - 05 Oct.
4. Login as Rahul. My Tasks shows 2 tasks. Open first, Start, attach file, Submit. Expect: status submitted, version 1, reviewer notified.
5. Login as Kavya. Review Queue shows it. Open, Approve. Expect: task approved, removed from other's conflict list if applicable.
6. Request revision path: submit second task, reviewer rejects with comments. Expect: status revision, revisionCount 1, assignee sees feedback, resubmits (version 2), reviewer approves.
7. Complete all tasks. Expect: project status completed, progress 100%.
8. Check bell (unread count, latest 10, click navigates + marks read) and project Activity feed entries.
9. Manager Reports: open Analytics/JSP/Laravel links in new tabs. Run `npm run sync`, verify MySQL counts match Firestore via `db/seed-check.sql`.
