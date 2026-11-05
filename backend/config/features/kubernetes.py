"""Kubernetes feature module.

Feature flags are disabled by default. When enabled, this module returns
settings snippets that can be merged into Django settings.

Currently this project does not change runtime behavior unless you later wire
additional integrations (e.g., health probes, structured logging, or
Kubernetes-specific hostnames).
"""

from typing import Any, Dict


def is_enabled(dyn_settings: Any) -> bool:
    return bool(getattr(dyn_settings, "ENABLE_KUBERNETES", False))


def get_feature_config(dyn_settings: Any) -> Dict[str, Any]:
    if not is_enabled(dyn_settings):
        return {}

    # Placeholders for future wiring.
    return {
        "KUBERNETES_ENABLED": True,
        # Example env-driven values (keep lightweight for now)
        "KUBERNETES_NAMESPACE": getattr(dyn_settings, "KUBERNETES_NAMESPACE", ""),
    }

