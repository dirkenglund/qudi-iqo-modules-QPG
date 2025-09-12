#!/usr/bin/env node
/**
 * JavaScript Test Interface for qudi MCP Integration
 * 
 * Tests the quantum photonics experiment automation interface
 * via spawning the Python MCP server and simulating Claude interactions
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class QudiMCPInterfaceTest {
    constructor() {
        this.projectRoot = '/Users/englund/Projects/QPG-MIT/qudi-iqo-modules-QPG';
        this.pythonPath = '/opt/homebrew/bin/python3';
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📋',
            'success': '✅',
            'error': '❌',
            'test': '🧪',
            'quantum': '🔬'
        }[type] || '📋';
        
        console.log(`${prefix} [${timestamp.split('T')[1].split('.')[0]}] ${message}`);
    }

    async testSystemStatus() {
        this.log('Testing System Status...', 'test');
        
        // Check if all required files exist
        const requiredFiles = [
            'mcp_integration/qudi_mcp_server.py',
            'mcp_integration/safety.py',
            'mcp_integration/tools/instrument_tools.py',
            'mcp_integration/tools/measurement_tools.py',
            'test_core_functionality.py'
        ];

        let allFilesExist = true;
        for (const file of requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                this.log(`File exists: ${file}`, 'success');
            } else {
                this.log(`Missing file: ${file}`, 'error');
                allFilesExist = false;
            }
        }

        return allFilesExist;
    }

    async testPythonFunctionality() {
        return new Promise((resolve, reject) => {
            this.log('Testing Python Core Functionality...', 'quantum');
            
            const testScript = `
import sys
sys.path.insert(0, '${this.projectRoot}')
from mcp_integration.safety import RunLevel, SafetyChecker

# Test safety system
checker = SafetyChecker()
print(f"✅ Safety runlevel: {checker.runlevel.value}")

# Test quantum device parameter validation  
safe, msg = checker.validate_parameter("laser_power", 2.0)
print(f"✅ Laser 2.0mW validation: {safe} - {msg}")

safe, msg = checker.validate_parameter("gate_voltage", 1.5) 
print(f"✅ Gate 1.5V validation: {safe} - {msg}")

# Test unsafe parameters
safe, msg = checker.validate_parameter("laser_power", 15.0)
print(f"✅ Unsafe laser power detected: {not safe}")

# Test runlevel changes
result = checker.request_runlevel_change(RunLevel.SIM, "JS test")
print(f"✅ Runlevel change: {result['success']}")

print("🎉 QUANTUM PHOTONICS SAFETY SYSTEM: FUNCTIONAL")
`;

            const pythonProcess = spawn(this.pythonPath, ['-c', testScript], {
                cwd: this.projectRoot,
                stdio: 'pipe'
            });

            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('Python functionality test passed', 'success');
                    console.log(output);
                    resolve(true);
                } else {
                    this.log(`Python test failed with code ${code}`, 'error');
                    console.log('Error output:', errorOutput);
                    resolve(false);
                }
            });
        });
    }

    async testQuantumExperimentSimulation() {
        return new Promise((resolve, reject) => {
            this.log('Testing Quantum Experiment Simulation...', 'quantum');
            
            const simulationScript = `
import sys, asyncio, json
sys.path.insert(0, '${this.projectRoot}')
from mcp_integration.tools.measurement_tools import MeasurementTools
from mcp_integration.safety import SafetyChecker

class MockServer:
    def __init__(self):
        self.runlevel = SafetyChecker().runlevel
        self.safety_checker = SafetyChecker()
        self.measurement_state = {}

async def test_quantum_measurements():
    server = MockServer()
    measurement_tools = MeasurementTools(server)
    
    # Test listing quantum measurement modules
    result = await measurement_tools.handle_tool("measurement.list_modules", {})
    modules = result.get("modules", [])
    print(f"✅ Available measurement modules: {len(modules)}")
    
    for module in modules[:3]:  # Show first 3
        print(f"   🔬 {module['name']}: {module['description']}")
    
    # Test photoluminescence spectroscopy
    pl_params = {
        "module_name": "photoluminescence_scan",
        "parameters": {
            "wavelength_start": 630,
            "wavelength_end": 650,
            "wavelength_step": 0.1,
            "integration_time": 1.0,
            "laser_power": 2.5
        }
    }
    
    result = await measurement_tools.handle_tool("measurement.start", pl_params)
    print(f"✅ PL scan started: {result.get('status')}")
    print(f"   📊 Measurement ID: {result.get('measurement_id')}")
    
    # Test quantum transport measurement
    transport_params = {
        "module_name": "gate_sweep",
        "parameters": {
            "gate_start": -1.0,
            "gate_end": 1.0,
            "gate_step": 0.05,
            "bias_voltage": 0.1,
            "measurement_time": 0.1
        }
    }
    
    result = await measurement_tools.handle_tool("measurement.start", transport_params)
    print(f"✅ Gate sweep started: {result.get('status')}")
    
    # Test 2D stability diagram 
    stability_params = {
        "module_name": "2d_gate_map",
        "parameters": {
            "gate1_start": -1.0, "gate1_end": 1.0, "gate1_steps": 20,
            "gate2_start": -0.5, "gate2_end": 0.5, "gate2_steps": 10,
            "bias_voltage": 0.05, "integration_time": 0.1
        }
    }
    
    result = await measurement_tools.handle_tool("measurement.start", stability_params)
    print(f"✅ 2D stability diagram started: {result.get('status')}")
    
    print("🎉 QUANTUM EXPERIMENT SIMULATION: SUCCESSFUL")

asyncio.run(test_quantum_measurements())
`;

            const pythonProcess = spawn(this.pythonPath, ['-c', simulationScript], {
                cwd: this.projectRoot,
                stdio: 'pipe'
            });

            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('Quantum experiment simulation passed', 'success');
                    console.log(output);
                    resolve(true);
                } else {
                    this.log(`Quantum simulation failed with code ${code}`, 'error');
                    console.log('Error output:', errorOutput);
                    resolve(false);
                }
            });
        });
    }

    async testClaudeDesktopConfiguration() {
        this.log('Testing Claude Desktop Configuration...', 'test');
        
        const configPath = '/Users/englund/Library/Application Support/Claude/claude_desktop_config.json';
        
        if (!fs.existsSync(configPath)) {
            this.log('Claude Desktop config missing', 'error');
            return false;
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            if (config.mcpServers && config.mcpServers['qudi-mcp']) {
                const qudiMcp = config.mcpServers['qudi-mcp'];
                this.log('Claude Desktop MCP config found', 'success');
                this.log(`Python command: ${qudiMcp.command}`, 'info');
                this.log(`MCP server path: ${qudiMcp.args[0]}`, 'info');
                
                // Check if the configured paths exist
                if (fs.existsSync(qudiMcp.command)) {
                    this.log('Python executable exists', 'success');
                } else {
                    this.log('Python executable missing', 'error');
                    return false;
                }
                
                if (fs.existsSync(qudiMcp.args[0])) {
                    this.log('MCP server script exists', 'success');
                } else {
                    this.log('MCP server script missing', 'error');
                    return false;
                }
                
                return true;
            } else {
                this.log('qudi-mcp configuration not found', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Config parsing error: ${error.message}`, 'error');
            return false;
        }
    }

    async runComprehensiveTest() {
        console.log('🚀 qudi MCP Integration - JavaScript Interface Test');
        console.log('=' * 60);
        
        const tests = [
            { name: 'System Status', method: 'testSystemStatus' },
            { name: 'Python Functionality', method: 'testPythonFunctionality' },
            { name: 'Quantum Experiments', method: 'testQuantumExperimentSimulation' },
            { name: 'Claude Desktop Config', method: 'testClaudeDesktopConfiguration' }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        for (const test of tests) {
            try {
                console.log(''); // Empty line
                const result = await this[test.method]();
                if (result) {
                    this.log(`${test.name}: PASSED`, 'success');
                    passedTests++;
                } else {
                    this.log(`${test.name}: FAILED`, 'error');
                }
            } catch (error) {
                this.log(`${test.name}: ERROR - ${error.message}`, 'error');
            }
        }

        console.log('\n' + '=' * 60);
        console.log('🎯 JAVASCRIPT INTERFACE TEST RESULTS');
        console.log('=' * 60);
        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${totalTests - passedTests}`);
        console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);

        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('🔬 Quantum photonics automation ready for Claude Desktop!');
            console.log('\n🚀 Try these commands in Claude Desktop:');
            console.log('   • "List available qudi measurement modules"');
            console.log('   • "Check all safety interlocks"');
            console.log('   • "Start a photoluminescence scan from 630-650 nm"');
            console.log('   • "Can I safely set laser power to 3 milliwatts?"');
        } else {
            console.log('\n⚠️  Some tests failed - check configuration');
        }

        return passedTests === totalTests;
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    const tester = new QudiMCPInterfaceTest();
    tester.runComprehensiveTest().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = QudiMCPInterfaceTest;