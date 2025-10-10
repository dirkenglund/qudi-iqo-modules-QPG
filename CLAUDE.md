# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **qudi-iqo-modules**, a collection of measurement modules for qudi (Quantum Diamond microscopy) experiments, particularly focused on color centers in semiconductor materials. It's built on top of qudi-core and provides specialized hardware interfaces, logic modules, and GUIs for quantum experiments.

### Dual-Repository Setup

This repository works in tandem with **qudi-mcp-integration** (https://github.com/dirkenglund/qudi-mcp-integration) for AI-driven quantum experiment control:

- **qudi-iqo-modules** (this repo): Core measurement modules, hardware drivers, and experimental toolchains
- **qudi-mcp-integration**: Model Context Protocol integration enabling natural language control of experiments via Claude

**Recommended workspace structure:**
```
C:\Software\
├── qudi-iqo-modules-QPG\     (this repository - measurement foundation)
└── qudi-mcp-integration\      (AI control layer)
```

## Development Setup

### Environment Setup
This project uses the **qudimcp** conda environment:

```bash
# Activate the qudimcp conda environment
conda activate qudimcp

# Or using full path (if conda not in PATH):
source /c/Users/Experiment/anaconda3/envs/qudimcp/Scripts/activate
```

### Installation Commands
```bash
# After activating qudimcp environment:
# Install qudi-iqo-modules in development mode
python -m pip install -e .

# Install qudi-mcp-integration (in parallel directory)
cd ../qudi-mcp-integration
pip install -r requirements-standalone.txt
```

### Daily Startup Workflow
```bash
# Terminal 1: Start qudi measurement system
conda activate qudimcp
qudi

# Alternative: Start with debug output
qudi -d

# Terminal 2: Start MCP server for Claude integration
conda activate qudimcp
cd /c/Software/qudi-mcp-integration
python qudi_mcp_server.py
```

### Testing
```bash
# Run the test suite (bash script that starts qudi and tests notebooks)
./tests/test.sh
```

## Architecture

The codebase follows qudi's modular architecture with three main layers:

### Integration Architecture

When used with qudi-mcp-integration, the complete system architecture is:

```
Claude Desktop ↔ MCP ↔ qudi_mcp_server ↔ qudi-iqo-modules ↔ Instruments
```

**Flow:**
1. **Natural Language → MCP**: Claude interprets experiment descriptions
2. **MCP → qudi**: Safety-validated commands sent to measurement modules
3. **qudi → Hardware**: Instrument control via hardware modules
4. **Data Flow**: Experimental results flow back for analysis and model updates

**Safety Integration**: qudi-mcp-integration provides safety runlevels (dry-run → sim → live) with parameter validation for cryostat and laser systems.

### Module Structure
- **`src/qudi/hardware/`** - Hardware interface modules for specific instruments
  - Organized by category: `awg/`, `camera/`, `dummy/`, `laser/`, `microwave/`, etc.
  - Each hardware module implements qudi interfaces for instrument control

- **`src/qudi/logic/`** - Business logic modules that coordinate hardware and provide measurement functionality
  - Core logic modules: `scanning_probe_logic.py`, `odmr_logic.py`, `pulsed_measurement_logic.py`
  - Specialized toolchains for confocal scanning, time series, ODMR, pulsed measurements

- **`src/qudi/gui/`** - PyQt5/PySide2 graphical user interfaces
  - Organized by measurement type: `scanning/`, `odmr/`, `time_series/`, `pulsed/`
  - Uses `.ui` files for interface layouts

### Key Interfaces
- **`src/qudi/interface/`** - Abstract base classes that define hardware contracts
- Hardware modules must implement these interfaces to be used by logic modules

### Configuration System
- **`src/qudi/default.cfg`** - Default configuration with dummy hardware for testing
- Configuration files define which modules to load and their connections
- Real configurations typically stored in user directories (not in source)

## Available Toolchains

The default configuration provides these measurement toolchains:
- **Time series** (slow counting) - `time_series_gui` + `time_series_reader_logic`
- **Confocal scanning** - `scanner_gui` + `scanning_probe_logic`
- **CW ODMR** - `odmr_gui` + `odmr_logic`
- **Pulsed measurements** - `pulsed_gui` + `pulsed_measurement_logic`
- **Point of Interest (POI) management** - `poimanager_gui` + `poi_manager_logic`
- **Camera control** - `camera_gui` + `camera_logic`
- **Laser control** - `laser_gui` + `laser_logic`
- **Spectrometer** - `spectrometer_gui` + `spectrometer_logic`
- **NV Calculator** - `nv_calculator_gui` + `nv_calculator_logic`

### For Diamond Color Center / Cryostat Systems

**Key toolchains for SNV characterization:**
- **Confocal scanning**: Spatial mapping of color centers, photoluminescence imaging
- **ODMR**: Optically detected magnetic resonance for spin state characterization
- **Pulsed measurements**: Coherence time measurements, Rabi oscillations, spin echo
- **Time series**: Photon counting, blinking dynamics, stability monitoring
- **Spectrometer**: Emission spectra, phonon sidebands, Stark effect measurements

**Cryostat considerations:**
- Temperature control integration via appropriate hardware modules
- Magnetic field control for Zeeman effect studies
- Laser power management for low-temperature operation

## Development Guidelines

### Python Environment
- Requires Python 3.8-3.10
- Main dependencies: qudi-core, numpy, scipy, matplotlib, PySide2, PyVisa, nidaqmx

### Module Development
- When creating hardware modules, inherit from appropriate interface classes
- Follow the existing naming patterns: `<vendor>_<model>.py`
- Hardware modules should handle instrument-specific communication protocols
- Logic modules coordinate between hardware and provide high-level measurement APIs

### Configuration
- Test with dummy hardware using `default.cfg` before connecting real instruments
- Each module has configurable parameters set in the configuration file
- Hardware modules specify connection parameters (COM ports, IP addresses, etc.)

### Remote Access
- qudi supports remote module access via network (default port 12345)
- Jupyter kernel integration available for scripting (port 18861)
- Use `force_remote_calls_by_value: True` for numpy compatibility

## Common Development Patterns

### Adding Hardware Support
1. Create hardware module in appropriate `src/qudi/hardware/` subdirectory
2. Implement required interface methods from `src/qudi/interface/`
3. Add configuration entry pointing to your hardware module
4. Test with dummy setup first, then real hardware

### Creating Measurements
1. Logic modules handle measurement coordination and data processing
2. Connect to required hardware modules via configuration
3. Implement StatusVars for persistent settings and ConfigOptions for parameters
4. Use qudi's threading and connector systems for hardware access

### GUI Development
1. GUIs connect to logic modules, not directly to hardware
2. Use existing GUI patterns from similar measurement types
3. Store UI layouts in `.ui` files alongside Python GUI modules

## Model-Based Learning Workflow

### QuTiP Model Integration

For improving QuTiP models of SNV color centers through experimental feedback:

1. **Experiment Design**: Use Claude + MCP to design parameter sweeps targeting model validation
2. **Data Collection**: Automated measurement campaigns via qudi toolchains
3. **Model Comparison**: Compare experimental results with QuTiP predictions
4. **Parameter Optimization**: Use experimental data to refine model parameters
5. **Validation**: Iterative testing of updated models against new measurements

### Claude Desktop Configuration
Add this to your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json` or Windows equivalent):

```json
{
  "mcpServers": {
    "qudi-mcp": {
      "command": "C:/Users/Experiment/anaconda3/envs/qudimcp/python.exe",
      "args": ["C:/Software/qudi-mcp-integration/qudi_mcp_server.py"],
      "cwd": "C:/Software/qudi-mcp-integration"
    }
  }
}
```

### Typical Workflow Commands (via MCP)
```
"Get qudi station information"
"Set runlevel to dry-run for safety testing"
"Measure ODMR spectrum from 2.85-2.88 GHz with 1 MHz steps"
"Scan confocal area around current POI with 100nm resolution"
"Run Rabi oscillation measurement from 0-1000ns with 10ns steps"
"Extract T2* coherence time from spin echo data"
"Check safety interlocks before live hardware measurement"
```

### Data Analysis Integration
- Experimental results automatically available for QuTiP model fitting
- Plot extraction tools for data visualization
- Parameter estimation workflows for model refinement
- Safety runlevels: dry-run → sim → live (with parameter validation)

## Cross-Repository Development Workflow

### Working Across Both Repositories

1. **Start qudi-iqo-modules**: Get measurement systems running first
2. **Configure MCP integration**: Set up qudi-mcp-integration to connect to running qudi instance
3. **Iterative development**: Use Claude for experiment control while developing/debugging measurement modules
4. **Model updates**: Feed experimental results back into QuTiP models

### Common Tasks
- **Hardware debugging**: Use traditional qudi GUIs alongside MCP natural language control
- **New measurement development**: Implement in qudi-iqo-modules, expose via MCP integration
- **Safety testing**: Use MCP dry-run and simulation modes before live hardware

## File Locations

- **Module source**: `src/qudi/`
- **Default config**: `src/qudi/default.cfg`
- **Documentation**: `docs/` (installation guide, setup guides for each toolchain)
- **Tests**: `tests/test.sh` (notebook-based integration tests)