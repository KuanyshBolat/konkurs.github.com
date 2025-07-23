import 'package:flutter/material.dart';
import '../services/emergency_service.dart';
import '../models/emergency_models.dart';

class SettingsScreen extends StatefulWidget {
  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final EmergencyService _emergencyService = EmergencyService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF121212),
      appBar: AppBar(
        title: Text('Настройки', style: TextStyle(color: Colors.white)),
        backgroundColor: Color(0xFF121212),
        iconTheme: IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Emergency Contacts Section
            _buildContactsSection(),
            
            SizedBox(height: 24),
            
            // Shake Sensitivity Section
            _buildShakeSensitivitySection(),
          ],
        ),
      ),
    );
  }

  Widget _buildContactsSection() {
    return Card(
      color: Color(0xFF1E1E1E),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.phone, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Text(
                  'Экстренные контакты',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 16),
            
            // Contacts list
            ..._emergencyService.contacts.map((contact) => _buildContactItem(contact)),
            
            SizedBox(height: 16),
            
            // Add contact button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _showAddContactDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFFFF3B30),
                  padding: EdgeInsets.symmetric(vertical: 12),
                ),
                child: Text(
                  'Добавить контакт',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactItem(EmergencyContact contact) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.white24, width: 0.5),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  contact.name,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  contact.phone,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          if (contact.id != "1") // Don't allow deleting the emergency service contact
            TextButton(
              onPressed: () => _removeContact(contact.id),
              child: Text(
                'Удалить',
                style: TextStyle(color: Colors.red),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildShakeSensitivitySection() {
    return Card(
      color: Color(0xFF1E1E1E),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Чувствительность активации',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            SizedBox(height: 16),
            
            ...[
              _SensitivityOption(
                value: 1,
                label: 'Низкая',
                description: 'Требуется сильное встряхивание',
              ),
              _SensitivityOption(
                value: 2,
                label: 'Средняя',
                description: 'Стандартная чувствительность',
              ),
              _SensitivityOption(
                value: 3,
                label: 'Высокая',
                description: 'Активация при легком движении',
              ),
            ].map((option) => _buildSensitivityOption(option)),
          ],
        ),
      ),
    );
  }

  Widget _buildSensitivityOption(_SensitivityOption option) {
    bool isSelected = _emergencyService.shakeSensitivity == option.value;
    
    return GestureDetector(
      onTap: () => _updateShakeSensitivity(option.value),
      child: Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Color(0xFFFF3B30) : Colors.white24,
            width: 2,
          ),
          color: isSelected ? Color(0xFFFF3B30).withOpacity(0.1) : Colors.transparent,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              option.label,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 4),
            Text(
              option.description,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddContactDialog() {
    String name = '';
    String phone = '';

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Color(0xFF1E1E1E),
          title: Text(
            'Добавить контакт',
            style: TextStyle(color: Colors.white),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                onChanged: (value) => name = value,
                style: TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Имя контакта',
                  labelStyle: TextStyle(color: Colors.white70),
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white30),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Color(0xFFFF3B30)),
                  ),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                onChanged: (value) => phone = value,
                style: TextStyle(color: Colors.white),
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Номер телефона',
                  labelStyle: TextStyle(color: Colors.white70),
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white30),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Color(0xFFFF3B30)),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Отмена',
                style: TextStyle(color: Colors.white70),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                if (name.isNotEmpty && phone.isNotEmpty) {
                  _addContact(name, phone);
                  Navigator.pop(context);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFFF3B30),
              ),
              child: Text(
                'Добавить',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );
  }

  void _addContact(String name, String phone) {
    setState(() {
      _emergencyService.addContact(name, phone);
    });
  }

  void _removeContact(String id) {
    setState(() {
      _emergencyService.removeContact(id);
    });
  }

  Future<void> _updateShakeSensitivity(int sensitivity) async {
    await _emergencyService.setShakeSensitivity(sensitivity);
    setState(() {});
  }
}

class _SensitivityOption {
  final int value;
  final String label;
  final String description;

  _SensitivityOption({
    required this.value,
    required this.label,
    required this.description,
  });
}