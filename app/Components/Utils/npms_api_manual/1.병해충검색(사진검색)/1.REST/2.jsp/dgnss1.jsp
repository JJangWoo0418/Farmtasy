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

//페이지 이동
function fncGoPage(start){
	with(document.apiForm){
		startPoint.value = start;
		method="get";
		action = "dgnss1.jsp";
		target = "_self";
		submit();
	}
}

//다음화면으로 이동
function fncNextPage(cCode, cName, start){
	with(document.apiForm){
		cropCode.value = cCode;
		cropName.value = cName;
		bfStartPoint.value = start;
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
<input type="hidden" name="startPoint" value=""/>
<input type="hidden" name="bfStartPoint" value=""/>
<input type="hidden" name="cropSectionCode" value="<%=request.getParameter("cropSectionCode")%>"/>
<input type="hidden" name="cropSectionName" value="<%=request.getParameter("cropSectionName")%>"/>
<input type="hidden" name="cropCode" value=""/>
<input type="hidden" name="cropName" value=""/>
<%
	//사진검색 2

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC12";// 사진검색 2의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	parameter += "&cropSectionCode="+ request.getParameter("cropSectionCode");
	
	//페이지 이동 처리
	if(request.getParameter("startPoint")!=null&&!request.getParameter("startPoint").equals("")){
		parameter += "&startPoint="+ request.getParameter("startPoint");
	}else if(request.getParameter("bfStartPoint")!=null&&!request.getParameter("bfStartPoint").equals("")){
		parameter += "&startPoint="+ request.getParameter("bfStartPoint");
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
	
		int size = 0;
		
		NodeList items = null;
		NodeList cropNames = null;
		NodeList thumbImgs = null;
		NodeList cropCodes = null;
		NodeList categoryes = null;
		
		items = doc.getElementsByTagName("item");
		size = doc.getElementsByTagName("item").getLength();
		cropNames = doc.getElementsByTagName("cropName");
		thumbImgs = doc.getElementsByTagName("thumbImg");
		cropCodes = doc.getElementsByTagName("cropCode");
		categoryes = doc.getElementsByTagName("category");
		
	%> 

	home &gt; <%=URLDecoder.decode(request.getParameter("cropSectionName"), "utf-8")%> 	<!-- 히스토리 -->
	<br/>
				<table  border="0" cellspacing="0" cellpadding="0">
				<%if(size == 0){%>
					<tr>
						<td width="100%" valign="top" style="padding-top:12px;">조회한 정보가 없습니다.</td>
                    </tr> 
                <%}else{
                	for(int i=0; i<size; i++){
					
                		String thumbImg = thumbImgs.item(i).getFirstChild() == null ? "" : thumbImgs.item(i).getFirstChild().getNodeValue();//이미지 URL
                		String cropCode = cropCodes.item(i).getFirstChild() == null ? "" : cropCodes.item(i).getFirstChild().getNodeValue();//작물코드(사진검색3를 위한 키값)
                		String cropName = cropNames.item(i).getFirstChild() == null ? "" : cropNames.item(i).getFirstChild().getNodeValue();//작물명
				%>
				<%if( (i%4) == 0){ %><!-- 한줄에 4개씩 -->
				    <tr>
				<%}%>

                      <td width="25%" valign="top" style="padding-top:12px;text-align:center;"> 
					  
                        <a href="javascript:fncNextPage('<%=cropCode%>', '<%=cropName%>', '<%=startPoint%>');">
							<img src="<%=thumbImg%>" width="100px" height="85px" border="0" alt="" style="border:1px #CCC solid;  padding:10px "   />
						</a>
						<br/>
						<span style="padding-top:5px;letter-spacing: -1px; word-spacing: 0px;">
							<a href="javascript:fncNextPage('<%=cropCode%>', '<%=cropName%>', '<%=startPoint%>');" style="text-align:center;"><%=cropName%></a> 
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

<br/>
<%
//페이징 처리 시작
	int pageGroupSize = 10;
	int pageSize = 0;
	try{
		pageSize = Integer.parseInt(displayCount);
	}catch(Exception e){
		pageSize = 10;
	}
	int start = 0; 
	try{
		start = Integer.parseInt(startPoint);
	}catch(Exception e){
		start = 1;
	}
	
	int currentPage = (int)(Math.ceil((double)start / (double)pageSize));

	int startRow = (currentPage - 1) * pageSize + 1;//한 페이지의 시작글 번호 
	int endRow = currentPage * pageSize;//한 페이지의 마지막 글번호           
	int count = Integer.parseInt( totalCnt);                                                            
	int number=0;                                                             

		
	number=count-(currentPage-1)*pageSize;//글목록에 표시할 글번호                                                                  
    
	//페이지그룹의 갯수                                                                                                             
	//ex) pageGroupSize가 3일 경우 '[1][2][3]'가 pageGroupCount 개 만큼 있다.                                                       
	int pageGroupCount = count/(pageSize*pageGroupSize)+( count % (pageSize*pageGroupSize) == 0 ? 0 : 1);                           
	//페이지 그룹 번호                                                                                                              
	//ex) pageGroupSize가 3일 경우  '[1][2][3]'의 페이지그룹번호는 1 이고  '[2][3][4]'의 페이지그룹번호는 2 이다.                   
	int numPageGroup = (int) Math.ceil((double)currentPage/pageGroupSize);                                                          


	if(count > 0){
		int pageCount = count / pageSize + ( count % pageSize == 0 ? 0 : 1);
		int startPage = pageGroupSize*(numPageGroup-1)+1;
		int endPage = startPage + pageGroupSize-1;
		int pageNo = 0; int startPnt = 0;
		
		if(endPage > pageCount){
			endPage = pageCount;
		}
		
		if(numPageGroup > 1){
			pageNo = (numPageGroup-2)*pageGroupSize+1;
			startPnt = ((pageNo-1)*pageSize)+1;
			out.println("<a href='javascript:fncGoPage("+startPnt+");'>[이전]</a>");
		}
		
		for(int i=startPage; i<=endPage; i++){
			pageNo = i;
			startPnt = ((pageNo-1)*pageSize)+1;
			out.print("<a href='javascript:fncGoPage("+startPnt+");'>");
			if(currentPage == i){
				out.print("<strong>["+i+"]</strong>");
			}else{
				out.print("["+i+"]");
			}
			out.println("</a>");
		}
		
		if(numPageGroup < pageGroupCount){
			pageNo = (numPageGroup*pageGroupSize+1);
			startPnt = ((pageNo-1)*pageSize)+1;
			out.println("<a href='javascript:fncGoPage("+startPnt+");'>[다음]</a>");
		}
%>
<div>
<%
	}
	//페이징 처리 끝
%>
</div>



	<%}%>

</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.jsp'" value="이전화면으로"/>
</body>
</html>