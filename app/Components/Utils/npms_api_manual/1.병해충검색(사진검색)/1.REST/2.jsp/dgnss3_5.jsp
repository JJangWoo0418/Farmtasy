<%@page import="java.io.InputStream"%>
<%@page import="java.net.URLEncoder"%>
<%@page import="java.net.URLDecoder"%>
<%@page import="org.w3c.dom.NodeList"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import="org.w3c.dom.Document"%>
<%@page import="java.net.URL"%>

<%@ page contentType="text/html; charset=utf-8" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">

<script type='text/javascript'>

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss2.jsp";
		target = "_self";
		submit();
	}
}

</script>

</head>
<body>    
<form name="apiForm">
<input type="hidden" name="startPoint"/>
<input type="hidden" name="bfStartPoint" value="<%=request.getParameter("bfStartPoint")%>"/>
<input type="hidden" name="cropSectionCode" value="<%=request.getParameter("cropSectionCode")%>"/>
<input type="hidden" name="cropSectionName" value="<%=request.getParameter("cropSectionName")%>"/>
<input type="hidden" name="cropCode" value="<%=request.getParameter("cropCode")%>"/>
<input type="hidden" name="cropName" value="<%=request.getParameter("cropName")%>"/>

<%
	//잡초 상세조회

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC10";// 잡초상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	parameter += "&weedsKey="+ request.getParameter("pestKey");

	//서버와 통신
	URL apiUrl = new URL("http://ncpms.rda.go.kr/npmsAPI/service?"+parameter);
	InputStream apiStream = apiUrl.openStream();

	Document doc = null;
	try{
		//xml document
		doc =	DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(apiStream);
		
		//기본정보
		try{buildTime = doc.getElementsByTagName("buildTime").item(0).getFirstChild().getNodeValue();}catch(Exception e){buildTime = "";}//생성시간
		try{totalCnt = doc.getElementsByTagName("totalCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){totalCnt = "";}//전체 갯수
		try{startPoint = doc.getElementsByTagName("startPoint").item(0).getFirstChild().getNodeValue();}catch(Exception e){startPoint = "";}//시작지점
		try{displayCount = doc.getElementsByTagName("displayCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){displayCount = "";}//출력갯수
		try{errorMsg = doc.getElementsByTagName("errorMsg").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorMsg = "";}//에러코드(에러발생시에만 생성)
		try{errorCode = doc.getElementsByTagName("errorCode").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorCode = "";}//에러메시지(에러발생시에만 생성)
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		apiStream.close();
	}
%>

    
   <%if( !errorCode.equals("")){%>
      농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
	  <br/>
	  <%=errorMsg%>
	<%}else{

		//이미지
		NodeList imageList = null;
		NodeList imageItems = null;
		int imageSize = 0;
		imageList = doc.getElementsByTagName("imageList");
		imageItems = imageList.item(0).getChildNodes();
		imageSize = imageItems.getLength();

		
		String weedsKorName = null;
		String weedsScientificName = null;
		String weedsFamily = null;
		String weedsJpnName = null;
		String weedsEngName = null;
		String weedsShape = null;
		String weedsEcology = null;
		String weedsHabitat = null;
		String literature = null;
		
		try{weedsKorName = doc.getElementsByTagName("weedsKorName").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsKorName = "";}//잡초명
		try{weedsScientificName = doc.getElementsByTagName("weedsScientificName").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsScientificName = "";}//잡초학명
		try{weedsFamily = doc.getElementsByTagName("weedsFamily").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsFamily = "";}//과명
		try{weedsJpnName = doc.getElementsByTagName("weedsJpnName").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsJpnName = "";}//잡초일문명
		try{weedsEngName = doc.getElementsByTagName("weedsEngName").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsEngName = "";}//잡초영문명
		try{weedsShape = doc.getElementsByTagName("weedsShape").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsShape = "";}//형태
		try{weedsEcology = doc.getElementsByTagName("weedsEcology").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsEcology = "";}//생태
		try{weedsHabitat = doc.getElementsByTagName("weedsHabitat").item(0).getFirstChild().getNodeValue();}catch(Exception e){weedsHabitat = "";}//서식지
		try{literature = doc.getElementsByTagName("literature").item(0).getFirstChild().getNodeValue();}catch(Exception e){literature = "";}//참고문헌
		
	%> 

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>잡초명</td>
				<td><%=weedsKorName%></td>
			</tr>
			<tr>
				<td>잡초학명</td>
				<td><%=weedsScientificName%></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><%=weedsFamily%></td>
			</tr>
			<tr>
				<td>잡초일문명</td>
				<td><%=weedsJpnName%></td>
			</tr>
			<tr>
				<td>잡초영문명</td>
				<td><%=weedsEngName%></td>
			</tr>
			<tr>
				<td>형태</td>
				<td><%=weedsShape%></td>
			</tr>
			<tr>
				<td>생태</td>
				<td><%=weedsEcology%></td>
			</tr>
			<tr>
				<td>서식지</td>
				<td><%=weedsHabitat%></td>
			</tr>
			<tr>
				<td>참고문헌</td>
				<td><%=literature%></td>
			</tr>
		</table>
		
	<br/>
	<br/>
	<%if(imageSize>0){%>
		&gt; 잡초 이미지
		<table  border="1" cellspacing="0" cellpadding="0">
		<%for(int i=0; i<imageSize; i++){%>
			<tr>
				<td><%=imageItems.item(i).getChildNodes().item(0).getFirstChild().getNodeValue()%></td>
				<td><img src="<%=imageItems.item(i).getChildNodes().item(2).getFirstChild().getNodeValue()%>" width="320px" height="300px"/></td>
			</tr>
		<%}%>
		</table>
	<%}%>
	
	<%}%>
</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.jsp'" value="처음화면으로"/>&nbsp;
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
</body>
</html>