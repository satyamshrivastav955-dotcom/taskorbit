<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<html>
<head><title>Project report</title><link rel="stylesheet" href="../report.css" /><link rel="stylesheet" href="../print.css" media="print" /></head>
<body>
<h1>Project report</h1>
<div class="bar"><div class="fill" style="width:${completion}%"></div></div>
<table>
<tr><th>Title</th><th>Assignee</th><th>Dates</th><th>Status</th><th>Revisions</th><th>Conflict</th></tr>
<c:forEach var="t" items="${tasks}">
<tr><td>${t.title}</td><td>${t.assigneeId}</td><td>${t.startDate} - ${t.deadline}</td><td>${t.status}</td><td>${t.revisionCount}</td><td>${t.hasConflict}</td></tr>
</c:forEach>
</table>
<button onclick="window.print()">Print / Save as PDF</button>
</body>
</html>
