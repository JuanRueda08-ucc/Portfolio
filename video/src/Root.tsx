import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, anclaCalma, totalFrames, vinylPlayer } from "./apps";

export const Root: React.FC = () => (
  <>
    <Composition id="ancla-calma" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(anclaCalma)} defaultProps={anclaCalma} />
    <Composition id="vinyl-player" component={Demo} width={1280} height={800} fps={FPS} durationInFrames={totalFrames(vinylPlayer)} defaultProps={vinylPlayer} />
  </>
);
