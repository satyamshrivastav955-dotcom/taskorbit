<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<html>
<head><title>Projects - TaskOrbit report</title><link rel="stylesheet" href="${pageContext.request.contextPath}/report.css" /></head>
<body>
<h1>Projects</h1>
<p><a href="${pageContext.request.contextPath}/logout">Sign out</a></p>
<table>
<tr><th>Title</th><th>Status</th><th>Deadline</th><th>Report</th></tr>
<c:forEach var="p" items="${projects}">
<tr><td>${p.title}</td><td>${p.status}</td><td>${p.deadline}</td>
<td><a href="${pageContext.request.contextPath}/report?projectId=${p.id}">Open report</a></td></tr>
</c:forEach>
</table>
</body>
</html>
