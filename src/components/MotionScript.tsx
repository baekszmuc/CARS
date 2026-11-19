/**
 * 스크롤 모션 보조 스크립트.
 * CSS 스크롤 타임라인(animation-timeline)을 지원하지 않는 브라우저(iPhone Safari·Firefox 등)에서
 * 같은 모션을 IntersectionObserver 로 재현한다. 요소가 화면에 들어올 때마다 다시 움직인다.
 * 정적 미리보기(preview-snapshot)에서도 남도록 id="motion-script" 를 유지한다.
 */
const code = `(function(){
var d=document.documentElement;
if(!window.IntersectionObserver||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(window.CSS&&CSS.supports&&CSS.supports("animation-timeline: view()"))return;
d.classList.add("js-motion");
function init(){
  var els=[].slice.call(document.querySelectorAll(".reveal,.reveal-photo"));
  els.forEach(function(el){
    var sib=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains("reveal")||c.classList.contains("reveal-photo")}):[];
    el.style.setProperty("--ri",Math.min(Math.max(sib.indexOf(el),0),5));
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting)e.target.classList.add("is-in");
    else if(e.boundingClientRect.top>0)e.target.classList.remove("is-in");
  })},{rootMargin:"0px 0px -12% 0px",threshold:0.05});
  els.forEach(function(el){io.observe(el)});
  var p=document.querySelector(".hero-parallax"),l=[].slice.call(document.querySelectorAll(".hero-lift")),t=false;
  if(!p&&!l.length)return;
  function f(){t=false;var h=window.innerHeight,y=Math.min(window.scrollY,h);
    if(p)p.style.transform="scale("+(1+0.15*y/h)+") translateY("+(8*y/h)+"%)";
    var k=Math.min(window.scrollY/(0.75*h),1);
    l.forEach(function(e){e.style.opacity=String(1-k);e.style.transform="translateY("+(-80*k)+"px)"});}
  window.addEventListener("scroll",function(){if(!t){t=true;requestAnimationFrame(f)}},{passive:true});f();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();`;

export function MotionScript() {
  return <script id="motion-script" dangerouslySetInnerHTML={{ __html: code }} />;
}
