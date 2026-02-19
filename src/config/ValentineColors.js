import * as THREE from 'https://jspm.dev/three'

function hexToLinear(hex){
const c=new THREE.Color(hex)
c.convertSRGBToLinear()
return Object.freeze(c)
}

function hexToSRGB(hex){
return Object.freeze(new THREE.Color(hex))
}

export const ValentineColors=Object.freeze({

hex:Object.freeze({

primary:"#ff2e88",
primarySoft:"#ff6ec7",

secondary:"#ff1744",
secondarySoft:"#ff4569",

accent:"#ff00aa",
accentSoft:"#ff88cc",

deep:"#8b004f",
deepSoft:"#b30059",

glow:"#ff99cc",
glowStrong:"#ff3366",

portalInner:"#ff6ec7",
portalOuter:"#ff1744",

vortexA:"#ff2e88",
vortexB:"#ff1744",

blackholeCore:"#2a0015",
blackholeEdge:"#ff0066",

particle:"#ff66aa",

backgroundTop:"#1a000a",
backgroundBottom:"#000000"

}),

srgb:Object.freeze({

primary:hexToSRGB("#ff2e88"),
primarySoft:hexToSRGB("#ff6ec7"),

secondary:hexToSRGB("#ff1744"),
secondarySoft:hexToSRGB("#ff4569"),

accent:hexToSRGB("#ff00aa"),
accentSoft:hexToSRGB("#ff88cc"),

deep:hexToSRGB("#8b004f"),
deepSoft:hexToSRGB("#b30059"),

glow:hexToSRGB("#ff99cc"),
glowStrong:hexToSRGB("#ff3366"),

portalInner:hexToSRGB("#ff6ec7"),
portalOuter:hexToSRGB("#ff1744"),

vortexA:hexToSRGB("#ff2e88"),
vortexB:hexToSRGB("#ff1744"),

blackholeCore:hexToSRGB("#2a0015"),
blackholeEdge:hexToSRGB("#ff0066"),

particle:hexToSRGB("#ff66aa"),

backgroundTop:hexToSRGB("#1a000a"),
backgroundBottom:hexToSRGB("#000000")

}),

linear:Object.freeze({

primary:hexToLinear("#ff2e88"),
primarySoft:hexToLinear("#ff6ec7"),

secondary:hexToLinear("#ff1744"),
secondarySoft:hexToLinear("#ff4569"),

accent:hexToLinear("#ff00aa"),
accentSoft:hexToLinear("#ff88cc"),

deep:hexToLinear("#8b004f"),
deepSoft:hexToLinear("#b30059"),

glow:hexToLinear("#ff99cc"),
glowStrong:hexToLinear("#ff3366"),

portalInner:hexToLinear("#ff6ec7"),
portalOuter:hexToLinear("#ff1744"),

vortexA:hexToLinear("#ff2e88"),
vortexB:hexToLinear("#ff1744"),

blackholeCore:hexToLinear("#2a0015"),
blackholeEdge:hexToLinear("#ff0066"),

particle:hexToLinear("#ff66aa"),

backgroundTop:hexToLinear("#1a000a"),
backgroundBottom:hexToLinear("#000000")

}),

uniform:Object.freeze({

primary:{value:hexToLinear("#ff2e88")},
secondary:{value:hexToLinear("#ff1744")},
accent:{value:hexToLinear("#ff00aa")},

glow:{value:hexToLinear("#ff99cc")},
glowStrong:{value:hexToLinear("#ff3366")},

portalInner:{value:hexToLinear("#ff6ec7")},
portalOuter:{value:hexToLinear("#ff1744")},

blackholeCore:{value:hexToLinear("#2a0015")},
blackholeEdge:{value:hexToLinear("#ff0066")}

}),

background:Object.freeze(
hexToLinear("#000000")
),

fog:Object.freeze(
hexToLinear("#1a000a")
)

})
