from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Standardizes error responses across all API endpoints.
    Format:
    {
        "success": false,
        "message": "...",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        customized_data = {
            "success": False,
            "status_code": response.status_code,
            "message": "An error occurred while processing the request.",
            "errors": response.data,
        }

        # Provide a friendlier message if detail exists
        if isinstance(response.data, dict) and "detail" in response.data:
            customized_data["message"] = str(response.data["detail"])

        response.data = customized_data
    else:
        logger.exception("Unhandled server error: %s", exc)
        return Response(
            {
                "success": False,
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Internal server error. Please try again later.",
                "errors": {"detail": str(exc)},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response

