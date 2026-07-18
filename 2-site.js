/* GLOBAL SCRIPT: load once per page, before the closing body tag.
   Self-detecting per page. Covers scroll reveals, the sticky header, the
   mobile menu, the active nav marker and the problem-to-pillar selector.
   The hero intro and reveal motion are pure CSS, not handled here. */
/* Vector-Ops site script.
   No animation library. The hero intro and the reveal transitions are pure CSS,
   so motion is never waiting on a download. All this does is add .is-in when an
   element scrolls into view, plus the header, menu, nav and selector behaviour.
   Safe wherever GoHighLevel injects it, and it cannot leave content invisible. */
(function(){
  "use strict";
  if (window.__voSiteInit) return;
  window.__voSiteInit = true;

  var root = document.documentElement;

  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function reveals(){
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    /* No IntersectionObserver, or motion flag never applied: just show everything. */
    if (!('IntersectionObserver' in window) || !root.classList.contains('vo-anim')) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0.01 });

    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  function header(){
    var head = document.getElementById('siteHeader');
    var nav = document.getElementById('mainNav');
    var toggle = document.getElementById('navToggle');

    if (head) {
      var lastY = window.scrollY;
      window.addEventListener('scroll', function(){
        var y = window.scrollY;
        var menuOpen = nav && nav.classList.contains('is-open');
        if (y > 120 && y > lastY && !menuOpen) head.classList.add('is-hidden');
        else head.classList.remove('is-hidden');
        lastY = y;
      }, { passive: true });
    }

    if (toggle && nav) {
      toggle.addEventListener('click', function(){
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var path = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
    if (!path) path = 'index';

    /* The four service pages are not in the nav; they hang off Services, so
       light Services up when you are on one of them. */
    var PARENT = { 'full-review':'services', 'pillar-reviews':'services',
                   'delivery-oversight':'services', 'digital-leadership':'services' };
    if (PARENT[path]) path = PARENT[path];

    var links = document.querySelectorAll('.main-nav a');
    for (var i = 0; i < links.length; i++) {
      var target = (links[i].getAttribute('href') || '').split('/').pop().replace(/\.html$/, '');
      if (target && target === path && !links[i].classList.contains('nav-cta')) {
        links[i].classList.add('is-active');
      }
    }
  }

  /* Problem-to-pillar selector: recommends a route, shows no prices */
  function selector(){
    var routeEl = document.getElementById('selRoute');
    if (!routeEl) return;
    var PILLAR_PAGE = 'pillar-reviews.html';
    var ROUTES = {
      service:  { name:'Focused Pillar Review: IT Service Quality and User Experience', link:PILLAR_PAGE,
        why:'Complaints, inconsistent service or service reporting you cannot fully trust.',
        get:'An independent service view, user evidence, a challenge to the service reporting, and first improvement actions with a Now / Next / Later route.' },
      people:   { name:'Focused Pillar Review: Team Resilience and Key-Person Continuity', link:PILLAR_PAGE,
        why:'Too much knowledge sits with one or two people, with no tested fallback.',
        get:'A dependency map, a continuity risk view, the documentation gaps and an immediate mitigation route.' },
      delivery: { name:'Focused Pillar Review: Delivery and Change Capability', link:PILLAR_PAGE,
        why:'Projects are drifting, overrunning or not landing, and ownership is unclear.',
        get:'A delivery health view, the risks and issues, a scope and accountability check, and recovery actions.' },
      cyber:    { name:'Focused Pillar Review: Cyber Posture and Resilience', link:PILLAR_PAGE,
        why:'The board needs evidence that cyber risk is controlled, not reassurance.',
        get:'A cyber assurance view, the evidence gaps, priority risks and a board-ready cyber summary.' },
      infra:    { name:'Focused Pillar Review: Infrastructure, Network, Cloud and Endpoint', link:PILLAR_PAGE,
        why:'Concerns about Wi-Fi, broadband, cloud, identity, devices or patching.',
        get:'An infrastructure and platform risk view, endpoint and patching assurance where evidence exists, and an improvement roadmap.' },
      data:     { name:'Focused Pillar Review: Data Protection, Safeguarding and Accessibility', link:PILLAR_PAGE,
        why:'Fragmented evidence around GDPR, DPIAs, filtering, monitoring or accessibility.',
        get:'An evidence review, the gaps and risks, next steps and a leadership summary.' },
      supplier: { name:'Focused Pillar Review: Supplier, Contract and Value for Money', link:PILLAR_PAGE,
        why:'Suppliers report their own performance, and spend may not match need.',
        get:'A supplier and contract review, SLA challenge, value-for-money findings and a commercial risk view.' },
      strategy: { name:'Focused Pillar Review: Digital Leadership, Governance and Strategy', link:PILLAR_PAGE,
        why:'No clear roadmap, ownership model or board-level grip on IT.',
        get:'A governance position, the leadership gaps, roadmap direction and the assurance questions your board should be asking.' },
      ai:       { name:'Focused Pillar Review: AI and Automation Governance Readiness', link:PILLAR_PAGE,
        why:'AI is already being used but policy, controls and direction are unclear.',
        get:'An AI governance readiness view, the policy and evidence gaps, and a safe adoption roadmap.' },
      mat:      { name:'Focused Pillar Review: Academy Transformation and Integration', link:PILLAR_PAGE,
        why:'You are taking on a school or aligning academies to a trust standard.',
        get:'Incoming school due diligence, an inherited risk view, the gap against your trust standard and an integration roadmap.' },
      full:     { name:'Full Governance and Maturity Review', link:'full-review.html',
        why:'Several areas are of concern, or the board needs the complete independent picture.',
        get:'A full three-lens, ten-pillar review with board-ready findings, RAG and named maturity levels, risks, evidence confidence and a Now / Next / Later roadmap.' },
      call:     { name:'Free Assurance Scoping Call', link:'contact.html',
        why:'Not sure where to start. That is exactly what the call is for.',
        get:'Thirty minutes to route you to the right pillar review, full review, oversight or leadership support. Nothing sold on it.' }
    };
    var ORG = {
      school:'a single school', independent:'an independent school', mat:'a multi-academy trust',
      college:'a college or FE provider', other:'your organisation'
    };
    var state = { problem:'cyber', org:'mat', scope:'one' };
    var whyEl = document.getElementById('selWhy');
    var getEl = document.getElementById('selGet');
    var ctaEl = document.getElementById('selCta');
    function pick(){
      if (state.scope === 'unsure') return ROUTES.call;
      if (state.scope === 'several' || state.scope === 'wide' || state.scope === 'board') return ROUTES.full;
      return ROUTES[state.problem] || ROUTES.call;
    }
    function renderRoute(){
      var r = pick();
      routeEl.textContent = r.name;
      whyEl.textContent = r.why + ' Scoped for ' + (ORG[state.org] || 'your organisation') + '.';
      getEl.textContent = r.get;
      ctaEl.setAttribute('href', r.link);
      ctaEl.textContent = (r.link === 'contact.html') ? 'Request the free call' : 'See what this covers';
    }
    document.querySelectorAll('.est-opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        var group = btn.getAttribute('data-group');
        state[group] = btn.getAttribute('data-value');
        document.querySelectorAll('.est-opt[data-group="'+group+'"]').forEach(function(b){
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderRoute();
      });
    });
    renderRoute();
  }

  ready(function(){
    /* We are here, so the inline head failsafe is no longer needed. */
    if (window.__voFailsafe) clearTimeout(window.__voFailsafe);
    try {
      header();
      reveals();
      selector();
    } catch (e) {
      root.classList.remove('vo-anim');
    }
  });
})();
