import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:camera/camera.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/emergency_models.dart';

class EmergencyService {
  static final EmergencyService _instance = EmergencyService._internal();
  factory EmergencyService() => _instance;
  EmergencyService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  final Record _audioRecord = Record();
  
  CameraController? _cameraController;
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  
  Position? _currentLocation;
  bool _isRecording = false;
  int _shakeSensitivity = 2; // 1=low, 2=medium, 3=high
  
  List<EmergencyContact> _contacts = [
    EmergencyContact(
      id: "1",
      name: "Служба экстренного реагирования",
      phone: "+7-911-123-45-67",
    ),
  ];
  
  List<EmergencyRecord> _emergencyHistory = [
    EmergencyRecord(
      id: "1",
      timestamp: DateTime(2024, 1, 15, 14, 30),
      location: "ул. Пушкина, 10",
      status: EmergencyStatus.resolved,
    ),
    EmergencyRecord(
      id: "2",
      timestamp: DateTime(2024, 1, 10, 9, 15),
      location: "пр. Ленина, 25",
      status: EmergencyStatus.helpOnWay,
    ),
  ];

  // Getters
  List<EmergencyContact> get contacts => _contacts;
  List<EmergencyRecord> get emergencyHistory => _emergencyHistory;
  Position? get currentLocation => _currentLocation;
  int get shakeSensitivity => _shakeSensitivity;
  bool get isRecording => _isRecording;

  // Initialize the service
  Future<void> initialize() async {
    await _loadSettings();
    await _requestPermissions();
    await _getCurrentLocation();
    await _initializeCamera();
    _startShakeDetection();
  }

  // Load settings from SharedPreferences
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _shakeSensitivity = prefs.getInt('shake_sensitivity') ?? 2;
  }

  // Save shake sensitivity setting
  Future<void> setShakeSensitivity(int sensitivity) async {
    _shakeSensitivity = sensitivity;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('shake_sensitivity', sensitivity);
  }

  // Request necessary permissions
  Future<void> _requestPermissions() async {
    await [
      Permission.camera,
      Permission.microphone,
      Permission.location,
      Permission.storage,
    ].request();
  }

  // Get current location
  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }

      _currentLocation = await Geolocator.getCurrentPosition();
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  // Initialize camera
  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isNotEmpty) {
        _cameraController = CameraController(
          cameras.first,
          ResolutionPreset.medium,
        );
        await _cameraController!.initialize();
      }
    } catch (e) {
      print('Error initializing camera: $e');
    }
  }

  // Start shake detection
  void _startShakeDetection() {
    _accelerometerSubscription = accelerometerEvents.listen((event) {
      double totalAcceleration = (event.x * event.x + event.y * event.y + event.z * event.z);
      
      double threshold;
      switch (_shakeSensitivity) {
        case 1:
          threshold = 400; // Low sensitivity
          break;
        case 2:
          threshold = 225; // Medium sensitivity
          break;
        case 3:
          threshold = 100; // High sensitivity
          break;
        default:
          threshold = 225;
      }

      if (totalAcceleration > threshold) {
        activateEmergency();
      }
    });
  }

  // Activate emergency sequence
  Future<void> activateEmergency() async {
    try {
      // Play emergency sound
      await _playEmergencySound();
      
      // Start recording
      await _startRecording();
      
      // Update location
      await _getCurrentLocation();
      
      // Send emergency data after 15 seconds
      Timer(Duration(seconds: 15), () {
        _sendEmergencyData();
      });
      
    } catch (e) {
      print('Error activating emergency: $e');
    }
  }

  // Play emergency alarm sound
  Future<void> _playEmergencySound() async {
    try {
      // Create a simple beep sound using system sound
      await SystemSound.play(SystemSoundType.alert);
    } catch (e) {
      print('Error playing sound: $e');
    }
  }

  // Start recording audio and video
  Future<void> _startRecording() async {
    try {
      _isRecording = true;
      
      // Start audio recording
      final directory = await getApplicationDocumentsDirectory();
      final audioPath = '${directory.path}/emergency_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';
      
      if (await _audioRecord.hasPermission()) {
        await _audioRecord.start(
          path: audioPath,
          encoder: AudioEncoder.aacLc,
          bitRate: 128000,
          samplingRate: 44100,
        );
      }

      // Start video recording if camera is available
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        final videoPath = '${directory.path}/emergency_video_${DateTime.now().millisecondsSinceEpoch}.mp4';
        await _cameraController!.startVideoRecording();
      }

      // Stop recording after 15 seconds
      Timer(Duration(seconds: 15), () async {
        await _stopRecording();
      });

    } catch (e) {
      print('Error starting recording: $e');
      _isRecording = false;
    }
  }

  // Stop recording
  Future<void> _stopRecording() async {
    try {
      _isRecording = false;

      // Stop audio recording
      if (await _audioRecord.isRecording()) {
        await _audioRecord.stop();
      }

      // Stop video recording
      if (_cameraController != null && _cameraController!.value.isRecordingVideo) {
        await _cameraController!.stopVideoRecording();
      }
    } catch (e) {
      print('Error stopping recording: $e');
    }
  }

  // Send emergency data
  void _sendEmergencyData() {
    final emergencyData = {
      'userId': 'user123',
      'timestamp': DateTime.now().toIso8601String(),
      'location': _currentLocation != null
          ? {
              'latitude': _currentLocation!.latitude,
              'longitude': _currentLocation!.longitude,
            }
          : null,
      'contacts': _contacts.map((c) => c.toJson()).toList(),
    };

    print('Sending emergency data to Guard Me: $emergencyData');

    // Add to history
    final newRecord = EmergencyRecord(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      timestamp: DateTime.now(),
      location: _currentLocation != null
          ? '${_currentLocation!.latitude.toStringAsFixed(4)}, ${_currentLocation!.longitude.toStringAsFixed(4)}'
          : 'Неизвестно',
      status: EmergencyStatus.sent,
    );

    _emergencyHistory.insert(0, newRecord);
  }

  // Contact management
  void addContact(String name, String phone) {
    final newContact = EmergencyContact(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      phone: phone,
    );
    _contacts.add(newContact);
  }

  void removeContact(String id) {
    _contacts.removeWhere((contact) => contact.id == id);
  }

  // Cleanup
  void dispose() {
    _accelerometerSubscription?.cancel();
    _cameraController?.dispose();
    _audioRecord.dispose();
    _audioPlayer.dispose();
  }
}