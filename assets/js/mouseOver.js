var elem=document.getElementById("wrap");
var newAns="";
for(var a=0,l=elem.innerHTML.length;a<l;a++)
{
    newAns+='<span onmouseover="change1(this)" onmouseout="change2(this)" >'+elem.innerHTML.charAt(a)+'</span>';
}
elem.innerHTML=newAns;

function change1(x)
{
    x.style.color="pink";
}

function change2(x)
{
    x.style.color="purple";
}
