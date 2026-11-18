import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, anclaCalma, chefDigital, chefDigitalFull, finanziaFull, totalFrames, vinylPlayer } from "./apps";

export const Root: React.FC = () => (
  <>
    <Composition id="finanzia-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(finanziaFull)} defaultProps={finanziaFull} />
    <Composition id="chef-digital-full" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(chefDigitalFull)} defaultProps={chefDigitalFull} />
    <Composition id="ancla-calma" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(anclaCalma)} defaultProps={anclaCalma} />
    <Composition id="vinyl-player" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(vinylPlayer)} defaultProps={vinylPlayer} />
    <Composition id="chef-digital" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(chefDigital)} defaultProps={chefDigital} />
  </>
);
