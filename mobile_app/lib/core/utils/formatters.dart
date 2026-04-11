import 'package:intl/intl.dart';

class Formatters {
  const Formatters._();

  static final NumberFormat _currency = NumberFormat.currency(
    locale: 'en_IN',
    symbol: 'INR ',
    decimalDigits: 0,
  );

  static final DateFormat _date = DateFormat('dd MMM yyyy');
  static final DateFormat _dateTime = DateFormat('dd MMM yyyy, hh:mm a');

  static String currency(num value) => _currency.format(value);

  static String date(String? isoString) {
    if (isoString == null || isoString.isEmpty) {
      return 'N/A';
    }
    return _date.format(DateTime.parse(isoString).toLocal());
  }

  static String dateTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) {
      return 'N/A';
    }
    return _dateTime.format(DateTime.parse(isoString).toLocal());
  }
}
