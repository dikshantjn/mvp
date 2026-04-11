import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../models/auth_models.dart';
import '../session/app_session_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.sessionController});

  final AppSessionController sessionController;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _mobileController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  OtpRequestResult? _otpRequest;
  String? _errorMessage;

  @override
  void dispose() {
    _mobileController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.sessionController.requestOtp(
        _mobileController.text.trim(),
      );
      if (!mounted) {
        return;
      }
      setState(() => _otpRequest = result);
    } on ApiException catch (error) {
      setState(() => _errorMessage = error.message);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _verifyOtp() async {
    final otpRequest = _otpRequest;
    if (otpRequest == null) {
      return;
    }

    if (_otpController.text.trim().length != 6) {
      setState(() => _errorMessage = 'Enter the 6-digit OTP.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await widget.sessionController.verifyOtp(
        requestId: otpRequest.requestId,
        mobileNumber: _mobileController.text.trim(),
        otpCode: _otpController.text.trim(),
      );
      if (mounted) {
        context.go('/dashboard');
      }
    } on ApiException catch (error) {
      setState(() => _errorMessage = error.message);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOtpStep = _otpRequest != null;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Text(
                          'Unitary Care',
                          style: Theme.of(context).textTheme.headlineMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isOtpStep
                              ? 'Enter the 6-digit OTP sent to your registered mobile number.'
                              : 'Sign in with your mobile number to access payments, documents, progress updates, and support tickets.',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: _mobileController,
                          keyboardType: TextInputType.phone,
                          enabled: !isOtpStep && !_isLoading,
                          decoration: const InputDecoration(
                            labelText: 'Mobile Number',
                            hintText: '+919999999999',
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Enter your mobile number.';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        if (isOtpStep)
                          TextFormField(
                            controller: _otpController,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            decoration: const InputDecoration(
                              labelText: 'OTP Code',
                              hintText: '123456',
                            ),
                          ),
                        if (_errorMessage != null) ...<Widget>[
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage!,
                            style: TextStyle(color: Theme.of(context).colorScheme.error),
                          ),
                        ],
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _isLoading ? null : (isOtpStep ? _verifyOtp : _requestOtp),
                          child: Text(_isLoading ? 'Please wait...' : (isOtpStep ? 'Verify OTP' : 'Request OTP')),
                        ),
                        if (isOtpStep) ...<Widget>[
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: _isLoading
                                ? null
                                : () {
                                    setState(() {
                                      _otpRequest = null;
                                      _otpController.clear();
                                      _errorMessage = null;
                                    });
                                  },
                            child: const Text('Change mobile number'),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
