import 'package:flutter/material.dart';

class EmergencyContact {
  final String id;
  final String name;
  final String phone;

  EmergencyContact({
    required this.id,
    required this.name,
    required this.phone,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
    };
  }

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
    );
  }
}

enum EmergencyStatus { sent, helpOnWay, resolved }

class EmergencyRecord {
  final String id;
  final DateTime timestamp;
  final String location;
  final EmergencyStatus status;

  EmergencyRecord({
    required this.id,
    required this.timestamp,
    required this.location,
    required this.status,
  });

  String get statusText {
    switch (status) {
      case EmergencyStatus.sent:
        return 'Отправлено в Guard Me';
      case EmergencyStatus.helpOnWay:
        return 'Помощь в пути';
      case EmergencyStatus.resolved:
        return 'Решено';
    }
  }

  Color get statusColor {
    switch (status) {
      case EmergencyStatus.sent:
        return Colors.yellow;
      case EmergencyStatus.helpOnWay:
        return Colors.blue;
      case EmergencyStatus.resolved:
        return Colors.green;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'location': location,
      'status': status.index,
    };
  }

  factory EmergencyRecord.fromJson(Map<String, dynamic> json) {
    return EmergencyRecord(
      id: json['id'],
      timestamp: DateTime.parse(json['timestamp']),
      location: json['location'],
      status: EmergencyStatus.values[json['status']],
    );
  }
}