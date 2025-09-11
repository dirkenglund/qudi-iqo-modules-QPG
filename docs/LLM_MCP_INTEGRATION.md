# LLM MCP Integration for qudi-iqo-modules-QPG

## Overview

This document describes the integration of Large Language Model (LLM) control capabilities into the MIT Quantum Photonics Group's qudi measurement framework via the Model Context Protocol (MCP).

The integration enables Claude Code/Desktop to directly control quantum photonics experiments, instruments, and measurements through natural language commands while maintaining strict safety protocols.

## Architecture

### Communication Flow
```
Claude Code/Desktop ←→ MCP (STDIO/HTTP) ←→ qudi_mcp_server ←→ qudi modules ←→ Instruments
```

### Components

#### 1. MCP Server (`mcp_integration/qudi_mcp_server.py`)
- Main entry point for LLM communication
- Handles tool registration and routing
- Manages safety and runlevel control
- Provides unified interface to qudi functionality

#### 2. Safety System (`mcp_integration/safety.py`)
- **Runlevels**: `dry-run` → `sim` → `live` progression
- **Safety Limits**: Parameter validation against physical limits  
- **Interlocks**: Critical safety system monitoring
- **Emergency Controls**: Immediate stop and reset capabilities

#### 3. Tool Modules
- **Instrument Tools** (`tools/instrument_tools.py`): Load, configure, and control instruments
- **Measurement Tools** (`tools/measurement_tools.py`): Execute measurements and acquire data  
- **Safety Tools** (`tools/safety_tools.py`): Safety monitoring and emergency controls

## Runlevel System

### dry-run (Default)
- **Purpose**: Safe exploration and testing
- **Behavior**: All operations simulated, no hardware interaction
- **Use Cases**: Learning, development, scripting validation

### sim
- **Purpose**: Realistic testing with simulated responses
- **Behavior**: Hardware simulation with realistic timing and data
- **Use Cases**: Protocol development, measurement planning

### live  
- **Purpose**: Actual hardware control
- **Behavior**: Real instrument control with full safety monitoring
- **Requirements**: Explicit approval, safety interlock verification

## Available Tools

### Station Management
- `station.info` - Get station configuration and status
- `station.load_config` - Load qudi configuration file

### Instrument Control  
- `instrument.list` - List available instruments
- `instrument.load` - Initialize instrument drivers
- `instrument.get_parameters` - Read instrument parameters
- `instrument.set_parameter` - Set parameter with safety validation

### Measurements
- `measurement.list_modules` - Show available measurement types
- `measurement.start` - Begin measurement with parameters
- `measurement.status` - Check measurement progress
- `measurement.get_data` - Retrieve measurement results

### Safety & Control
- `safety.check_interlocks` - Verify all safety systems
- `safety.set_runlevel` - Change operation mode
- `system.emergency_stop` - Immediate halt of all operations

## Safety Protocols

### Parameter Limits
Default safety limits are enforced for all critical parameters:

| Parameter | Min | Max | Unit | Description |
|-----------|-----|-----|------|-------------|
| `laser_power` | 0.0 | 10.0 | mW | Laser power limit |
| `gate_voltage` | -2.0 | 2.0 | V | Gate voltage limits |
| `bias_voltage` | -1.0 | 1.0 | V | Bias voltage limits |
| `temperature` | 0.010 | 300.0 | K | Cryostat temperature range |
| `magnetic_field` | -9.0 | 9.0 | T | Magnetic field limits |

### Interlocks
Critical safety systems monitored continuously:
- Emergency stop status
- Cryostat pressure monitoring
- Temperature stability
- Instrument connectivity
- Laser safety shutters

### Approval Gates
- **Live Mode Entry**: Requires explicit approval + interlock verification
- **Critical Parameters**: High-risk parameter changes need confirmation
- **Emergency Reset**: Manual confirmation required after emergency stop

## Installation & Setup

### Prerequisites
```bash
pip install mcp qcodes numpy
```

### Configuration  
1. Clone the repository with MCP integration
2. Configure qudi station in standard configuration files
3. Set up Claude Desktop/Code MCP configuration
4. Test with dry-run mode before enabling live operations

### Claude Desktop Configuration
Create/update `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qudi-mcp": {
      "command": "/usr/bin/python3",
      "args": ["/path/to/qudi-iqo-modules-QPG/mcp_integration/qudi_mcp_server.py"],
      "env": {
        "PYTHONPATH": "/path/to/qudi-iqo-modules-QPG",
        "QUDI_CONFIG_PATH": "/path/to/your/qudi_config.cfg"
      }
    }
  }
}
```

## Usage Examples

### Basic System Check
```
Check the system status and available instruments
```

### Simple Measurement
```  
Start a photoluminescence scan from 630-650 nm with 1 second integration time
```

### Parameter Safety Validation
```
Validate if I can set gate1_voltage to 1.5V safely
```

### Emergency Procedures
```
Emergency stop all operations immediately
```

## Development Guidelines

### Adding New Tools
1. Implement tool logic in appropriate module (`tools/`)
2. Register tool in `qudi_mcp_server.py` tool list
3. Add safety validation for any parameters
4. Include comprehensive error handling
5. Test in dry-run mode first

### Safety Considerations
- All parameter changes must pass safety validation
- New tools should default to read-only in live mode
- Critical operations require explicit approval mechanisms
- Comprehensive logging required for audit trails

### Testing Protocol
1. **Dry-run Testing**: Validate logic without hardware
2. **Simulation Testing**: Verify realistic behavior  
3. **Hardware Validation**: Test with real instruments
4. **Safety Testing**: Verify all safety mechanisms work
5. **Integration Testing**: End-to-end workflow validation

## Current Limitations

### qudi Integration Status
- **Phase 1 Complete**: MCP server framework and safety system
- **Phase 2 Pending**: qudi core integration and instrument drivers  
- **Phase 3 Planned**: Advanced measurement workflows and data analysis

### Known Issues
- Real qudi station integration not yet implemented
- Live mode approval system requires manual implementation
- Advanced measurement modules need qudi-specific development

## Roadmap

### Short Term (1-2 weeks)
- [ ] Complete qudi core integration
- [ ] Implement real instrument driver connections
- [ ] Add human approval workflow for live mode
- [ ] Comprehensive testing with mock instruments

### Medium Term (1-2 months)  
- [ ] Integration with existing QPG measurement protocols
- [ ] Advanced measurement workflows (2D maps, time traces)
- [ ] Data export and analysis tool integration
- [ ] Web interface for monitoring and control

### Long Term (3+ months)
- [ ] Machine learning integration for measurement optimization
- [ ] Automated protocol generation from experimental goals
- [ ] Integration with lab information management systems
- [ ] Multi-user access control and experiment scheduling

## Support & Contact

For questions about this integration:
- **Technical Issues**: Create issues in the qudi-iqo-modules-QPG repository
- **Safety Concerns**: Contact QPG safety officer before enabling live mode  
- **qudi Questions**: Refer to main qudi documentation and community forums

---

**Last Updated**: 2024-09-11  
**Version**: 0.1.0  
**Status**: Development - Dry-run and Simulation modes functional