import { SectionTitle } from "../../ui";
import { DEFAULT_STAGES, type Stage } from "../../../app/data/projectPhases";

export type ProjectPhasesProps = {
  heading?: string;
  stages?: Stage[];
  className?: string;
};

export default function ProjectPhases({
  heading = "Этапы реализации проекта",
  stages = DEFAULT_STAGES,
  className = "",
}: ProjectPhasesProps) {
  return (
    <section className={`relative py-20 font-mono text-white flex flex-col text-center justify-center items-center ${className}`}>
      <SectionTitle heading={heading} />
      <div className="absolute inset-0 -z-10" />

      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_100%_at_50%_50%,#000_55%,transparent_100%)]">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[75%] w-[28%] rounded-[999px] blur-2xl"

        />
        <div
          className="absolute right-0 bottom-0 h-[70%] w-[30%] rounded-[999px] blur-2xl"

        />
      </div>

      <div className="relative mx-auto w-full overflow-visible">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-transparent md:bg-white/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-transparent md:bg-white/10" />

        <div className="grid grid-cols-1 md:grid-cols-3 overflow-visible">
          {stages.map((s) => (
            <StageCell key={s.number} stage={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StageCell({ stage }: { stage: Stage }) {
  return (
    <div className="relative flex flex-col items-center px-6 py-10 text-center">
      <div className="flex items-center justify-center text-center gap-5">
        <img src={stage.icon} className="w-15" alt="" />
        <span className="text-[68px] font-semibold flex items-center gap-4 text-[#6F6F6F]">
          {stage.number}
        </span>
      </div>

      <div className="relative my-3 isolate">
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[160px] w-[160px] rounded-full blur-[70px] opacity-95 bg-[radial-gradient(100%_105%_at_50%_50%,_rgba(59,252,212,0.60)_0%,_rgba(59,252,212,0.28)_38%,_transparent_78%)]"
        />

        <span className="relative z-[1] block h-2 w-2 rounded-full bg-emerald-400/90" aria-hidden>
          <span className="absolute inset-0 -z-10 rounded-full bg-emerald-400/35 blur-[6px]" />
        </span>
      </div>

      <h3 className="mt-1 text-[16px] font-semibold text-white md:text-[32px]">
        {stage.title}
      </h3>
      <p className="mt-1 max-w-[30ch] text-sm text-white/70 md:text-xl">
        {stage.subtitle}
      </p>
    </div>
  );
}




