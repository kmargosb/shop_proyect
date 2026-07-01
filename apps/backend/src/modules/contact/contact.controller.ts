import { asyncHandler } from '@/common/utils/asyncHandler';
import { contactSchema } from './contact.schema';
import { checkRateLimit } from '@/common/utils/rateLimit';
import * as contactService from './contact.service';

export const sendContact = asyncHandler(async (req, res) => {
  const data = contactSchema.parse(req.body);

  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  const rateLimit = await checkRateLimit(`contact:${ip}`, 2, 60 * 60);

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfter.toString());

    return res.status(429).json({
      message: 'Too many messages sent. Please try again later.',
      retryAfter: rateLimit.retryAfter,
    });
  }

  await contactService.sendContactMessage(data);

  res.status(200).json({
    success: true,
    message: 'Message sent successfully.',
  });
});
