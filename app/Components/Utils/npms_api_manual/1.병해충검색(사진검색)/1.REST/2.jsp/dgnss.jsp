<%@page import="java.io.InputStream"%>
<%@page import="java.net.URLEncoder"%>
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

//다음화면으로 이동
function fncNextPage(cCode, cName){
	with(document.apiForm){
		cropSectionCode.value = cCode;
		cropSectionName.value = cName;
		method="get";
		if(cCode=="6"){	//잡초인 경우
			action = "dgnss2.jsp";
		}else{			//잡초가 아닌 경우
			action = "dgnss1.jsp";
		}
		target = "_self";
		submit();
	}
}

</script>

</head>
<body>    
<form name="apiForm">
<input type="hidden" name="cropSectionCode"/>
<input type="hidden" name="cropSectionName"/>
<%
	//사진검색 1

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC11";// 사진검색 1의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	
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
	
		int size = 0;
		
		NodeList items = null;
		NodeList cropSectionNames = null;
		NodeList thumbImgs = null;
		NodeList cropSectionCodes = null;
		
		items = doc.getElementsByTagName("item");
		size = doc.getElementsByTagName("item").getLength();
		cropSectionNames = doc.getElementsByTagName("cropSectionName");
		thumbImgs = doc.getElementsByTagName("thumbImg");
		cropSectionCodes = doc.getElementsByTagName("cropSectionCode");
		
	%>
				<table  border="0" cellspacing="0" cellpadding="0">
				<%if(size == 0){%>
					<tr>
						<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
                    </tr> 
                <%}else{
                	for(int i=0; i<size; i++){
					
                		String cropSectionName = cropSectionNames.item(i).getFirstChild() == null ? "" : cropSectionNames.item(i).getFirstChild().getNodeValue();//작물분류명
                		String cropSectionCode = cropSectionCodes.item(i).getFirstChild() == null ? "" : cropSectionCodes.item(i).getFirstChild().getNodeValue();//작물분류코드(사진검색2를 위한 키값)
                		String thumbImg = thumbImgs.item(i).getFirstChild() == null ? "" : thumbImgs.item(i).getFirstChild().getNodeValue();//이미지 URL
				%>
				<%if( (i%4) == 0){ %><!-- 한줄에 4개씩 -->
				    <tr>
				<%}%>

                      <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
					  
                        <a href="javascript:fncNextPage('<%=cropSectionCode%>','<%=cropSectionName%>');">
							<img src="<%=thumbImg%>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
						</a>
						<br/>
						<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
							<a href="javascript:fncNextPage('<%=cropSectionCode%>','<%=cropSectionName%>');" style="text-align:center;"><%=cropSectionName%></a> 
                        </span>
                        
                        
                        </td>
				<%if( (i%4) == 3){ %>
				    </tr>
				<%}%>
				<%
                	}
                }
				%>
                  </table>
	<%}%>
</form>
</body>
</html>