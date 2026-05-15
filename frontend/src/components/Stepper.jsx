const STEPS = ['Upload', 'Generate', 'Review', 'Platform', 'Schedule', 'Done'];

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((name, i) => {
          const status = i < currentStep ? 'done' : i === currentStep ? 'active' : '';
          return (
            <div key={name} style={{ display: 'contents' }}>
              <div className={`step ${status}`}>
                <div className="step-num">{status === 'done' ? '✓' : i + 1}</div>
                <div className="step-name">{name}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < currentStep ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
