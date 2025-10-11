import { PulsingBorder } from "@paper-design/shaders-react"

export default function PulsingBorderShader(props: any) {
  // Filtrar props que no deben pasarse al DOM
  const { 
    // Props específicas del shader que podrían causar warnings
    spotsPerColor: _spotsPerColor,
    spotSize: _spotSize,
    pulse: _pulse,
    smoke: _smoke,
    smokeSize: _smokeSize,
    scale: _scale,
    rotation: _rotation,
    frame: _frame,
    // Mantener el resto de props válidas
    ...validProps 
  } = props;

  return (
    <PulsingBorder
      colors={["#87CEEB", "#B0E0E6", "#ADD8E6", "#E0F6FF"]}
      colorBack="#00000000"
      speed={1.5}
      roundness={1}
      thickness={0.05}
      softness={0.1}
      intensity={1}
      spotsPerColor={5}
      spotSize={0.1}
      pulse={0.2}
      smoke={0.5}
      smokeSize={2}
      scale={0.65}
      rotation={0}
      frame={9161408.251009725}
      {...validProps}
      style={{
        width: "535px",
        height: "511px",
        borderRadius: "0px",
        backgroundImage:
          "radial-gradient(circle in oklab, oklab(0% 0 -.0001 / 0%) 25.22%, oklab(70% -0.02 -0.08) 43.89%, oklab(0% 0 -.0001 / 0%) 60.04%)",
        ...validProps.style
      }}
    />
  )
}
