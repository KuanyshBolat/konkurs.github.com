import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/emergency_service.dart';
import '../models/emergency_models.dart';
import 'settings_screen.dart';
import 'history_screen.dart';

class SOSScreen extends StatefulWidget {
  @override
  _SOSScreenState createState() => _SOSScreenState();
}

class _SOSScreenState extends State<SOSScreen> with TickerProviderStateMixin {
  final EmergencyService _emergencyService = EmergencyService();
  bool _isConnected = true;
  bool _isActivated = false;
  bool _showFlash = false;
  
  late AnimationController _pulseController;
  late AnimationController _activationController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeService();
  }

  void _initializeAnimations() {
    _pulseController = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    )..repeat();

    _activationController = AnimationController(
      duration: Duration(milliseconds: 500),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _activationController, curve: Curves.easeInOut),
    );
  }

  Future<void> _initializeService() async {
    await _emergencyService.initialize();
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _activateEmergency() async {
    if (_isActivated) return;

    setState(() {
      _isActivated = true;
    });

    _activationController.repeat();
    
    // Flash red screen 3 times
    for (int i = 0; i < 3; i++) {
      setState(() {
        _showFlash = true;
      });
      await Future.delayed(Duration(milliseconds: 200));
      setState(() {
        _showFlash = false;
      });
      await Future.delayed(Duration(milliseconds: 200));
    }

    // Activate emergency service
    await _emergencyService.activateEmergency();

    // Reset after 17 seconds (15 for recording + 2 for processing)
    Future.delayed(Duration(seconds: 17), () {
      if (mounted) {
        setState(() {
          _isActivated = false;
        });
        _activationController.stop();
        _activationController.reset();
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _activationController.dispose();
    _emergencyService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Main content
          SafeArea(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Header
                  _buildHeader(),
                  
                  // Main content
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Instruction text
                        _buildInstructionText(),
                        
                        SizedBox(height: 60),
                        
                        // SOS Button
                        _buildSOSButton(),
                        
                        SizedBox(height: 60),
                        
                        // Status indicators
                        if (_isActivated) _buildStatusIndicators(),
                      ],
                    ),
                  ),
                  
                  // Footer
                  _buildFooter(),
                ],
              ),
            ),
          ),
          
          // Flash overlay
          if (_showFlash)
            Container(
              color: Color(0xFFFF3B30).withOpacity(0.8),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(
              Icons.shield,
              color: _isConnected ? Colors.green : Colors.red,
              size: 24,
            ),
            SizedBox(width: 8),
            Text(
              'Guard Me ${_isConnected ? "подключен" : "отключен"}',
              style: TextStyle(fontSize: 14, color: Colors.white70),
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => HistoryScreen()),
                );
              },
              icon: Icon(Icons.history, color: Colors.white),
            ),
            IconButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => SettingsScreen()),
                );
              },
              icon: Icon(Icons.settings, color: Colors.white),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInstructionText() {
    return Column(
      children: [
        Text(
          'Встряхните телефон или нажмите кнопку',
          style: TextStyle(
            fontSize: 18,
            color: Colors.white70,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 8),
        Text(
          'для активации',
          style: TextStyle(
            fontSize: 18,
            color: Colors.white70,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 16),
        Text(
          '(Встряхните устройство для демонстрации)',
          style: TextStyle(
            fontSize: 12,
            color: Colors.white38,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildSOSButton() {
    return AnimatedBuilder(
      animation: _isActivated ? _scaleAnimation : _pulseAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _isActivated ? _scaleAnimation.value : _pulseAnimation.value,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer ring
              if (!_isActivated)
                Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Color(0xFFFF3B30).withOpacity(0.3),
                      width: 4,
                    ),
                  ),
                ),
              
              // Main button
              GestureDetector(
                onTap: _activateEmergency,
                child: Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFFFF3B30),
                    boxShadow: [
                      BoxShadow(
                        color: Color(0xFFFF3B30).withOpacity(0.3),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Center(
                    child: _isActivated
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'АКТИВИРОВАНО',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (_emergencyService.isRecording) ...[
                                SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.videocam, color: Colors.white, size: 16),
                                    SizedBox(width: 8),
                                    Icon(Icons.mic, color: Colors.white, size: 16),
                                    SizedBox(width: 8),
                                    Text(
                                      'Запись...',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          )
                        : Text(
                            'SOS',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusIndicators() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          children: [
            Icon(Icons.location_on, color: Colors.white70, size: 16),
            SizedBox(width: 4),
            Text(
              'GPS активен',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
        SizedBox(width: 32),
        Row(
          children: [
            Icon(Icons.phone, color: Colors.white70, size: 16),
            SizedBox(width: 4),
            Text(
              'Уведомление отправлено',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        Text(
          'Экстренная служба • Всегда готова помочь',
          style: TextStyle(
            fontSize: 12,
            color: Colors.white38,
          ),
          textAlign: TextAlign.center,
        ),
        if (_emergencyService.currentLocation != null) ...[
          SizedBox(height: 4),
          Text(
            'Координаты: ${_emergencyService.currentLocation!.latitude.toStringAsFixed(4)}, ${_emergencyService.currentLocation!.longitude.toStringAsFixed(4)}',
            style: TextStyle(
              fontSize: 10,
              color: Colors.white24,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}