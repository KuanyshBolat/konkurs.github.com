import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/emergency_service.dart';
import '../models/emergency_models.dart';

class HistoryScreen extends StatefulWidget {
  @override
  _HistoryScreenState createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final EmergencyService _emergencyService = EmergencyService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF121212),
      appBar: AppBar(
        title: Text('История тревог', style: TextStyle(color: Colors.white)),
        backgroundColor: Color(0xFF121212),
        iconTheme: IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: _emergencyService.emergencyHistory.isEmpty
            ? _buildEmptyState()
            : _buildHistoryList(),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history,
            size: 64,
            color: Colors.white38,
          ),
          SizedBox(height: 16),
          Text(
            'История тревог пуста',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Здесь будут отображаться ваши экстренные вызовы',
            style: TextStyle(
              color: Colors.white38,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList() {
    return ListView.builder(
      itemCount: _emergencyService.emergencyHistory.length,
      itemBuilder: (context, index) {
        final record = _emergencyService.emergencyHistory[index];
        return _buildHistoryItem(record);
      },
    );
  }

  Widget _buildHistoryItem(EmergencyRecord record) {
    return Card(
      color: Color(0xFF1E1E1E),
      margin: EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Location and date
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.location_on,
                  color: Colors.white70,
                  size: 16,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        record.location,
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        _formatDateTime(record.timestamp),
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 12),
            
            // Status badge
            _buildStatusBadge(record),
            
            SizedBox(height: 8),
            
            // Additional info
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  color: Colors.white38,
                  size: 14,
                ),
                SizedBox(width: 4),
                Text(
                  _getTimeAgo(record.timestamp),
                  style: TextStyle(
                    color: Colors.white38,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(EmergencyRecord record) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: record.statusColor,
          width: 1,
        ),
      ),
      child: Text(
        record.statusText,
        style: TextStyle(
          color: record.statusColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final DateFormat formatter = DateFormat('dd MMMM yyyy, HH:mm', 'ru_RU');
    return formatter.format(dateTime);
  }

  String _getTimeAgo(DateTime dateTime) {
    final Duration difference = DateTime.now().difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} ${_getDaysWord(difference.inDays)} назад';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${_getHoursWord(difference.inHours)} назад';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${_getMinutesWord(difference.inMinutes)} назад';
    } else {
      return 'Только что';
    }
  }

  String _getDaysWord(int days) {
    if (days == 1) return 'день';
    if (days < 5) return 'дня';
    return 'дней';
  }

  String _getHoursWord(int hours) {
    if (hours == 1) return 'час';
    if (hours < 5) return 'часа';
    return 'часов';
  }

  String _getMinutesWord(int minutes) {
    if (minutes == 1) return 'минуту';
    if (minutes < 5) return 'минуты';
    return 'минут';
  }
}