<%
'불필요하게 건들지 마세요
Response.ContentType = "text/xml"
Response.AddHeader "Pragma", "no-cache"
Response.expires = -1
Response.buffer = True
Response.CharSet = "euc-kr"
	
	serviceType = "AA001"
	url = "http://ncpms.rda.go.kr/npmsAPI/service?"

	For Each pkey In request.Querystring
		url = url & pkey & "=" & Request.QueryString(pkey) & "&serviceType=" & serviceType & "&"
	Next 

	Set httpObj = Server.CreateObject("WinHttp.WinHttpRequest.5.1")
	httpObj.open "GET", url, False
	
	httpObj.Send()
	httpObj.WaitForResponse
	
	If httpObj.Status = "200" Then
		getSiteSourceGet = httpObj.ResponseBody
		
		response.binaryWrite getSiteSourceGet
		
	Else
		getSiteSourceGet = null
	End If 
	
	Set httpObj = Nothing

%>