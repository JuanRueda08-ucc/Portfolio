import { Composition } from "remotion";
import { Demo } from "./Demo";
import { PhoneDemo, phoneFrames } from "./PhoneDemo";
import { vigia, vigiaFull } from "./vigia";
import { FPS, ecosFull, tickgoFull, anclaCalma, anclaCalmaFull, chefDigital, chefDigitalFull, finanziaFull, totalFrames, vinylPlayer, vinylPlayerFull } from "./apps";

export const Root: React.FC = () => (
  <>
    <Composition id="vigia-full" component={PhoneDemo} width={1280} height={800} fps={FPS} durationInFrames={phoneFrames(vigiaFull)} defaultProps={vigiaFull} />
    <Composition id="vigia" component={PhoneDemo} width={1280} height={800} fps={FPS} durationInFrames={phoneFrames(vigia)} defaultProps={vigia} />
    <Composition id="tickgo-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(tickgoFull)} defaultProps={tickgoFull} />
    <Composition id="ecos-de-la-tierra-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(ecosFull)} defaultProps={ecosFull} />
    <Composition id="vinyl-player-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(vinylPlayerFull)} defaultProps={vinylPlayerFull} />
    <Composition id="finanzia-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(finanziaFull)} defaultProps={finanziaFull} />
    <Composition id="chef-digital-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(chefDigitalFull)} defaultProps={chefDigitalFull} />
    <Composition id="ancla-calma-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(anclaCalmaFull)} defaultProps={anclaCalmaFull} />
    <Composition id="ancla-calma" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(anclaCalma)} defaultProps={anclaCalma} />
    <Composition id="vinyl-player" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(vinylPlayer)} defaultProps={vinylPlayer} />
    <Composition id="chef-digital" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(chefDigital)} defaultProps={chefDigital} />
  </>
);
