import Nav from './Nav';
import Stepper from './Stepper';
import { usePost } from '../context/PostContext';

export default function PageShell({ children }) {
  const { state } = usePost();
  return (
    <>
      <Nav />
      <Stepper currentStep={state.currentStep} />
      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
