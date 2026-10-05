<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<html>
<head><title>Sign in - TaskOrbit report</title><link rel="stylesheet" href="${pageContext.request.contextPath}/report.css" /></head>
<body>
<h1>Sign in</h1>
<c:if test="${not empty error}"><p>${error}</p></c:if>
<form method="post" action="${pageContext.request.contextPath}/login">
<label>Email <input type="email" name="email" required /></label>
<label>Password <input type="password" name="password" required /></label>
<button type="submit">Sign in</button>
</form>
</body>
</html>
