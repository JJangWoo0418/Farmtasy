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
	//병 상세조회

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC05";// 병상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	parameter += "&sickKey="+ request.getParameter("pestKey");
	
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
		//병원체
		NodeList virusList = null;
		NodeList virusItems = null;
		int virusSize = 0;
		virusList = doc.getElementsByTagName("virusList");
		virusItems = virusList.item(0).getChildNodes();
		virusSize = virusItems.getLength();

		//이미지
		NodeList imageList = null;
		NodeList imageItems = null;
		int imageSize = 0;
		imageList = doc.getElementsByTagName("imageList");
		imageItems = imageList.item(0).getChildNodes();
		imageSize = imageItems.getLength();

		
		String cropName = null;
		String sickNameChn = null;
		String sickNameEng = null;
		String sickNameKor = null;
		String infectionRoute = null;
		String developmentCondition = null;
		String symptoms = null;
		String preventionMethod = null;
		String etc = null;
		
		try{cropName = doc.getElementsByTagName("cropName").item(0).getFirstChild().getNodeValue();}catch(Exception e){cropName = "";}//작물명
		try{sickNameChn = doc.getElementsByTagName("sickNameChn").item(0).getFirstChild().getNodeValue();}catch(Exception e){sickNameChn = "";}//병 한문명
		try{sickNameEng = doc.getElementsByTagName("sickNameEng").item(0).getFirstChild().getNodeValue();}catch(Exception e){sickNameEng = "";}//병 영문명
		try{sickNameKor = doc.getElementsByTagName("sickNameKor").item(0).getFirstChild().getNodeValue();}catch(Exception e){sickNameKor = "";}//병 한글명
		try{infectionRoute = doc.getElementsByTagName("infectionRoute").item(0).getFirstChild().getNodeValue();}catch(Exception e){infectionRoute = "";}//전염경로
		try{developmentCondition = doc.getElementsByTagName("developmentCondition").item(0).getFirstChild().getNodeValue();}catch(Exception e){developmentCondition = "";}//발생환경
		try{symptoms = doc.getElementsByTagName("symptoms").item(0).getFirstChild().getNodeValue();}catch(Exception e){symptoms = "";}//병 증상
		try{preventionMethod = doc.getElementsByTagName("preventionMethod").item(0).getFirstChild().getNodeValue();}catch(Exception e){preventionMethod = "";}//방제방법
		try{etc = doc.getElementsByTagName("etc").item(0).getFirstChild().getNodeValue();}catch(Exception e){etc = "";}//기타설명
		
	%> 

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>작물</td>
				<td><%=cropName%></td>
			</tr>
			<tr>
				<td>병명</td>
				<td><%=sickNameKor%><%=sickNameChn!=null?"/"+sickNameChn:""%><%=sickNameEng!=null?"/"+sickNameEng:""%></td>
			</tr>
			<tr>
				<td>전염경로</td>
				<td><%=infectionRoute%></td>
			</tr>
			<tr>
				<td>발생환경</td>
				<td><%=developmentCondition%></td>
			</tr>
			<tr>
				<td>병 증상</td>
				<td><%=symptoms%></td>
			</tr>
			<tr>
				<td>방제방법</td>
				<td><%=preventionMethod%></td>
			</tr>
			<tr>
				<td>기타설명</td>
				<td><%=etc%></td>
			</tr>


		</table>
	<br/>
	<br/>
	<%if(imageSize>0){%>
		&gt; 병 이미지
		<table  border="1" cellspacing="0" cellpadding="0">
		<%for(int i=0; i<imageSize; i++){%>
			<tr>
				<td><%=imageItems.item(i).getChildNodes().item(0).getFirstChild().getNodeValue()%></td>
				<td><img src="<%=imageItems.item(i).getChildNodes().item(2).getFirstChild().getNodeValue()%>" width="320px" height="300px"/></td>
			</tr>
		<%}%>
		</table>
	<%}%>
	
	<br/>
	<br/>
	<%if(virusSize>0){%>
		&gt; 관련 병원체 정보
		<table  border="1" cellspacing="0" cellpadding="0">
		<tr>
			<th>병원체 명</th>
		</tr>
		<%for(int i=0; i<virusSize; i++){%>
			<tr>
				<td><i><%=virusItems.item(i).getChildNodes().item(1).getFirstChild().getNodeValue()%></i></td>				
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