use std::sync::{Arc, Mutex};
use crate::types::CommitmentEvent;

/// In-process commitment queue for v1.
/// Replace with Redis pub/sub or NATS in v2 for multi-process communication
/// with the TypeScript prover service.
#[derive(Clone)]
pub struct Queue {
    inner: Arc<Mutex<Vec<CommitmentEvent>>>,
}

impl Queue {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Push a new commitment event.
    pub fn push(&self, event: CommitmentEvent) {
        self.inner.lock().unwrap().push(event);
    }

    /// Drain all pending events.
    pub fn drain(&self) -> Vec<CommitmentEvent> {
        let mut guard = self.inner.lock().unwrap();
        std::mem::take(&mut *guard)
    }

    pub fn len(&self) -> usize {
        self.inner.lock().unwrap().len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl Default for Queue {
    fn default() -> Self {
        Self::new()
    }
}
