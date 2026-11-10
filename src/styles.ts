export const STYLES = `
.lumi-roomba-stage { position:fixed; inset:0; z-index:40; pointer-events:none; overflow:hidden; }
.lumi-roomba { position:absolute; left:0; top:0; width:58px; height:58px; pointer-events:none; will-change:transform; }
.lumi-roomba-body { position:absolute; inset:5px; border-radius:50%; background:radial-gradient(ellipse at 33% 23%,#52585b 0%,#292d30 42%,#17191b 76%); border:2px solid #0c0e0f; box-shadow:0 3px 5px #0006,inset 0 0 0 2px #747a7c,inset 0 0 0 5px #222629; }
.lumi-roomba-bumper { position:absolute; inset:1px; border:3px solid transparent; border-right-color:#969d9f; border-radius:50%; }
.lumi-roomba-plate { position:absolute; inset:9px; border-radius:50%; background:linear-gradient(135deg,#4c5255,#262a2c 55%,#3c4245); border:1px solid #62696b; box-shadow:inset 0 1px 2px #aaa3; }
.lumi-roomba-clean { position:absolute; left:14px; top:14px; width:16px; height:16px; border:1px solid #8b9e88; border-radius:50%; background:radial-gradient(circle,#424c3d,#252d23); box-shadow:0 0 3px #a3d38b44; }
.lumi-roomba-clean::after { content:'CLEAN'; position:absolute; inset:0; display:grid; place-items:center; font:3px/1 sans-serif; letter-spacing:.3px; color:#d7e8d1; }
.lumi-roomba-sensor { position:absolute; right:3px; top:17px; width:5px; height:10px; border-radius:3px; background:#080b0c; box-shadow:inset -1px 0 1px #798285; }
.lumi-roomba-led { position:absolute; left:11px; top:20px; width:2px; height:4px; border-radius:2px; background:#a8ec83; box-shadow:0 0 3px #91df6c; }
.lumi-roomba-brush { position:absolute; width:18px; height:18px; left:36px; top:36px; animation:lumi-roomba-sweep .65s linear infinite; }
.lumi-roomba-brush i { position:absolute; top:8px; left:7px; height:2px; width:12px; background:linear-gradient(90deg,#565b58,#bbbda8); border-radius:2px; transform-origin:2px 1px; }
.lumi-roomba-brush i:nth-child(2) { transform:rotate(120deg); }
.lumi-roomba-brush i:nth-child(3) { transform:rotate(240deg); }
.lumi-roomba-stage[data-paused] .lumi-roomba-brush { animation-play-state:paused; }
.lumi-roomba-eyes { display:none; position:absolute; left:31px; top:12px; width:15px; height:33px; }
.lumi-roomba-googly .lumi-roomba-eyes { display:block; }
.lumi-roomba-eye { box-sizing:content-box; position:absolute; width:14px; height:15px; border:1px solid #b9bec4; border-radius:50%; background:radial-gradient(circle at 35% 25%,white 45%,#dce1e6); box-shadow:0 2px 3px #0007; }
.lumi-roomba-eye:nth-child(2) { top:17px; left:-1px; }
.lumi-roomba-pupil { position:absolute; left:3.5px; top:4px; width:7px; height:7px; border-radius:50%; background:radial-gradient(circle at 30% 25%,#fff 0 10%,#111 18%); }
.lumi-roomba-settings { padding:16px; color:var(--lumiverse-text,inherit); }
.lumi-roomba-settings h3 { margin:0 0 16px; }
.lumi-roomba-option { display:flex; align-items:center; gap:10px; min-height:44px; cursor:pointer; }
.lumi-roomba-option input { width:18px; height:18px; accent-color:var(--lumiverse-primary,#a8ec83); }
.lumi-roomba-settings p { font-size:13px; line-height:1.5; opacity:.75; }
@keyframes lumi-roomba-sweep { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .lumi-roomba-brush { animation:none; } }
`;
