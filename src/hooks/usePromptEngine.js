import { useEffect, useMemo } from 'react';
import { PromptEngine } from '../engine/promptEngine';
import { useStreamingClient } from './useStreamingClient';

export function usePromptEngine() {
  const { send, cancel } = useStreamingClient();
  const engine = useMemo(() => new PromptEngine(send), [send]);
  useEffect(() => () => engine.cancel(), [engine]);
  return { engine, cancel };
}
