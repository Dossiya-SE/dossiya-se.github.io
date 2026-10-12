(() => {
  const svg=d3.select("#ecosystemAtlas"), detail=document.querySelector("#atlasDetail"), filter=document.querySelector("#familyFilter");
  let data, root;
  const repoUrl=d=>"https://github.com/Dossiya-SE/"+encodeURIComponent(d.data.repo);
  function show(d){
    if(!d.data.repo)return;
    document.querySelector("#detailFamily").textContent=d.parent?.data?.name||"Repository";
    document.querySelector("#detailTitle").textContent=d.data.name;
    document.querySelector("#detailStatus").textContent=d.data.status||"repository";
    document.querySelector("#detailDescription").textContent="Primary navigation family: "+(d.parent?.data?.name||"—")+". This placement is taxonomic, not a scientific dependency claim.";
    const tags=document.querySelector("#detailTags"); tags.innerHTML="";
    (d.data.tags||[]).forEach(t=>{const li=document.createElement("li");li.textContent=t;tags.appendChild(li)});
    const a=document.querySelector("#detailLink");a.href=repoUrl(d);a.hidden=false;
    svg.selectAll(".node").attr("aria-current",null); d3.select(d._el).attr("aria-current","true");
  }
  function render(family="all"){
    svg.selectAll("*").remove();
    root=d3.hierarchy(data);
    if(family!=="all") root.children=(root.children||[]).filter(d=>d.data.name===family);
    const W=980,H=650,margin={top:36,right:280,bottom:36,left:38};
    d3.cluster().size([H-margin.top-margin.bottom,W-margin.left-margin.right])(root);
    const g=svg.attr("viewBox",`0 0 ${W} ${H}`).append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    g.selectAll(".link").data(root.links()).join("path").attr("class","link").attr("d",d=>{
      const mx=(d.source.y+d.target.y)/2;
      return `M${d.source.y},${d.source.x}C${mx},${d.source.x} ${mx},${d.target.x} ${d.target.y},${d.target.x}`;
    });
    const nodes=g.selectAll(".node").data(root.descendants()).join("g")
      .attr("class",d=>"node "+(d.depth===0?"root":d.children?"family":"repo"))
      .attr("transform",d=>`translate(${d.y},${d.x})`)
      .attr("tabindex",d=>d.data.repo?0:null)
      .attr("role",d=>d.data.repo?"link":"group")
      .attr("aria-label",d=>d.data.repo?`${d.data.name}. ${d.data.status}. Open repository details.`:d.data.name)
      .on("click",(e,d)=>show(d))
      .on("keydown",(e,d)=>{if(!d.data.repo)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();show(d)}});
    nodes.each(function(d){d._el=this});
    nodes.append("circle").attr("r",d=>d.depth===0?8:d.children?7:5);
    nodes.append("text").attr("dy","0.32em").attr("x",d=>d.children?-12:10).attr("text-anchor",d=>d.children?"end":"start")
      .text(d=>d.data.name.length>38?d.data.name.slice(0,36)+"…":d.data.name);
  }
  fetch("research-ecosystem.json").then(r=>{if(!r.ok)throw new Error("research-ecosystem.json");return r.json()}).then(d=>{
    data=d;(d.children||[]).forEach(f=>{const o=document.createElement("option");o.value=f.name;o.textContent=f.name;filter.appendChild(o)});render();
  }).catch(()=>{document.querySelector("#atlasError").hidden=false});
  filter.addEventListener("change",()=>render(filter.value));
  document.querySelector("#resetAtlas").addEventListener("click",()=>{filter.value="all";render();detail.scrollIntoView({block:"nearest"})});
})();