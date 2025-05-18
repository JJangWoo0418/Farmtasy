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

//해충화면으로 이동
function fncSvc07Dtl(key){
	with(document.apiForm){
		method="get";
		pestKey.value = key;
		action = "dgnss3_1.jsp";
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
<input type="hidden" name="partName" value="<%=request.getParameter("partName")%>"/>
<input type="hidden" name="categoryCode" value="<%=request.getParameter("categoryCode")%>"/>
<input type="hidden" name="pestName" value="<%=request.getParameter("pestName")%>"/>
<input type="hidden" name="pestKey"/>
<%
	//천적곤충 상세조회

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC15";// 천적곤충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	if(request.getParameter("insectKey")!=null && !request.getParameter("insectKey").equals("") ){
		parameter += "&insectKey="+ request.getParameter("insectKey");
	}else{
		parameter += "&insectKey="+ request.getParameter("pestKey");
	}

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

		//대상해충 리스트
		NodeList targetList = null;
		NodeList targetItems = null;
		int targetSize = 0;
		targetList = doc.getElementsByTagName("targetVermin");
		targetItems = targetList.item(0).getChildNodes();
		targetSize = targetItems.getLength();
		
		String insectSpeciesKor = null;
		String outsideDistribution = null;
		String domesticDistribution = null;
		String lifeCycle = null;
		String utilizationMethod = null;
		String examinResult = null;
		String etcCrop = null;
		String cropName = null;



		try{insectSpeciesKor = doc.getElementsByTagName("insectSpeciesKor").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectSpeciesKor = "";}//곤충한국종명
		try{outsideDistribution = doc.getElementsByTagName("outsideDistribution").item(0).getFirstChild().getNodeValue();}catch(Exception e){outsideDistribution = "";}//국외분포
		try{domesticDistribution = doc.getElementsByTagName("domesticDistribution").item(0).getFirstChild().getNodeValue();}catch(Exception e){domesticDistribution = "";}//국내분포
		try{lifeCycle = doc.getElementsByTagName("lifeCycle").item(0).getFirstChild().getNodeValue();}catch(Exception e){lifeCycle = "";}//생활사
		try{utilizationMethod = doc.getElementsByTagName("utilizationMethod").item(0).getFirstChild().getNodeValue();}catch(Exception e){utilizationMethod = "";}//이용방법
		try{examinResult = doc.getElementsByTagName("examinResult").item(0).getFirstChild().getNodeValue();}catch(Exception e){examinResult = "";}//시험결과
		try{etcCrop = doc.getElementsByTagName("etcCrop").item(0).getFirstChild().getNodeValue();}catch(Exception e){etcCrop = "";}//기타 작물
		try{cropName = doc.getElementsByTagName("cropName").item(0).getFirstChild().getNodeValue();}catch(Exception e){cropName = "";}//이용작물
		


		
	%> 

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>곤충한국종명</td>
				<td><%=insectSpeciesKor%></td>
			</tr>
			<tr>
				<td>국외분포</td>
				<td><%=outsideDistribution%></td>
			</tr>
			<tr>
				<td>국내분포</td>
				<td><%=domesticDistribution%></td>
			</tr>
			<tr>
				<td>생활사</td>
				<td><%=lifeCycle%></td>
			</tr>
			<tr>
				<td>이용방법</td>
				<td><%=utilizationMethod%></td>
			</tr>
			<tr>
				<td>시험결과</td>
				<td><%=examinResult%></td>
			</tr>
			<tr>
				<td>이용작물</td>
				<td><%=cropName%></td>
			</tr>
			<tr>
				<td>기타작물</td>
				<td><%=etcCrop%></td>
			</tr>
		</table>
		
	<br/>
	<br/>
	<%if(targetSize>0){%>
		&gt; 대상 해충
		<table  border="1" cellspacing="0" cellpadding="0">
		<colgroup>
			<col width="12%">
			<col width="30%">
			<col width="30%">
			<col width="*">
		</colgroup>
		<tr>
			<th>사진정보</th>
			<th>목/과</th>
			<th>국명(학명)</th>
			<th>피해작물</th>
		</tr>
		<%for(int i=0; i<targetSize; i++){%>
			<tr>
				<td><img src="<%=targetItems.item(i).getChildNodes().item(9).getFirstChild().getNodeValue()%>" width="120px" height="80px"/></td>
				<td><%=targetItems.item(i).getChildNodes().item(5).getFirstChild().getNodeValue()%>/<%=targetItems.item(i).getChildNodes().item(4).getFirstChild().getNodeValue()%></td>
				<td><%=targetItems.item(i).getChildNodes().item(3).getFirstChild().getNodeValue()%>(<%=targetItems.item(i).getChildNodes().item(2).getFirstChild().getNodeValue()%> <%=targetItems.item(i).getChildNodes().item(1).getFirstChild().getNodeValue()%>)</td>
				<td><%=targetItems.item(i).getChildNodes().item(7).getFirstChild().getNodeValue()%></td>

			</tr>
		<%}%>
		</table>
	<%}%>


	
	
	<%}%>
</form>

<br/>
<input type="button" onclick="javascript:history.back();" value="이전화면으로"/>
</body>
</html>