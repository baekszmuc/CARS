/**
 * 스크롤 모션 엔진 (모든 브라우저 공통).
 * - 등장(.reveal): 화면에 들어올 때마다 아래에서 떠오른다 (IntersectionObserver).
 * - 스크롤 연동: 스크롤 위치에 따라 사진이 커지고, 섹션이 넓어지고, 사진 안쪽이 패럴랙스로 움직인다.
 *   각 요소에 --p(등장 진행도 0→1)와 --c(화면 중앙 기준 위치 -1→1)를 넣고 CSS 가 그 값으로 변형한다.
 * 기존 클래스·속성만 선택하므로 정적 미리보기(preview-snapshot)에도 그대로 동작한다 (id="motion-script" 유지).
 * '동작 줄이기' 설정에서는 아무것도 하지 않는다.
 */
const code = `(function(){
var d=document.documentElement;
if(!window.IntersectionObserver||!window.requestAnimationFrame||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
d.classList.add("js-motion");
var SCRUB=".reveal-photo,[data-testid=vehicle-card] .aspect-\\\\[4\\\\/3\\\\],section[aria-labelledby=services],section[aria-labelledby=contact],#collection-title,.band-hero .max-w-4xl";
function cl(v){return v<0?0:v>1?1:v}
function init(){
  var rv=[].slice.call(document.querySelectorAll(".reveal,.reveal-photo"));
  rv.forEach(function(el){
    var sib=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains("reveal")||c.classList.contains("reveal-photo")}):[];
    el.style.setProperty("--ri",Math.min(Math.max(sib.indexOf(el),0),5));
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting)e.target.classList.add("is-in");
    else if(e.boundingClientRect.top>0)e.target.classList.remove("is-in");
  })},{rootMargin:"0px 0px -10% 0px",threshold:0.05});
  rv.forEach(function(el){io.observe(el)});
  var sc=[].slice.call(document.querySelectorAll(SCRUB));
  var hp=document.querySelector(".hero-parallax"),hl=[].slice.call(document.querySelectorAll(".hero-lift")),bh=document.querySelector(".band-hero .max-w-4xl"),tk=false;
  function f(){tk=false;var vh=window.innerHeight,y=window.scrollY;
    sc.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<-vh||r.top>2*vh)return;
      el.style.setProperty("--p",cl((vh-r.top)/(vh*0.75)).toFixed(3));
      el.style.setProperty("--c",Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/vh)).toFixed(3));});
    var k=cl(y/vh);
    if(hp)hp.style.transform="scale("+(1+0.18*k)+") translateY("+(10*k)+"%)";
    var q=cl(y/(0.75*vh));hl.forEach(function(e){e.style.opacity=String(1-q);e.style.transform="translateY("+(-90*q)+"px) scale("+(1-0.06*q)+")"});
    if(bh)bh.style.setProperty("--s",cl(y/(0.6*vh)).toFixed(3));
  }
  function on(){if(!tk){tk=true;requestAnimationFrame(f)}}
  window.addEventListener("scroll",on,{passive:true});window.addEventListener("resize",on);f();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();`;

export function MotionScript() {
  return <script id="motion-script" dangerouslySetInnerHTML={{ __html: code }} />;
}
