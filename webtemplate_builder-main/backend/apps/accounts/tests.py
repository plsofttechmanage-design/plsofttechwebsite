from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AccountsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"

    def test_customer_registration(self):
        payload = {
            "email": "newcustomer@example.com",
            "username": "newcustomer",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["user"]["role"], "CUSTOMER")

    def test_login_returns_jwt_and_user_data(self):
        user = User.objects.create_user(
            email="logintest@example.com",
            username="logintest",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        response = self.client.post(
            self.login_url,
            {"email": "logintest@example.com", "password": "Password123!"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "logintest@example.com")

    def test_logout_blacklists_refresh_token(self):
        user = User.objects.create_user(
            email="logouttest@example.com",
            username="logouttest",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        login_res = self.client.post(
            self.login_url,
            {"email": "logouttest@example.com", "password": "Password123!"},
            format="json"
        )
        refresh_token = login_res.data["refresh"]
        access_token = login_res.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_res = self.client.post("/api/auth/logout/", {"refresh": refresh_token}, format="json")
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # Attempting to refresh using blacklisted token must fail
        refresh_attempt = self.client.post("/api/auth/token/refresh/", {"refresh": refresh_token}, format="json")
        self.assertEqual(refresh_attempt.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_flow(self):
        user = User.objects.create_user(
            email="reset@example.com",
            username="resetuser",
            password="OldPassword123!",
            role=User.Role.CUSTOMER
        )
        # 1. Request reset
        req_res = self.client.post("/api/auth/password-reset/", {"email": "reset@example.com"}, format="json")
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)
        uid = req_res.data["debug_reset_token"]["uid"]
        token = req_res.data["debug_reset_token"]["token"]

        # 2. Confirm reset
        confirm_payload = {
            "uid": uid,
            "token": token,
            "new_password": "NewPassword123!",
            "new_password_confirm": "NewPassword123!",
        }
        confirm_res = self.client.post("/api/auth/password-reset-confirm/", confirm_payload, format="json")
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)

        # 3. Verify user can log in with new password
        login_res = self.client.post(
            self.login_url,
            {"email": "reset@example.com", "password": "NewPassword123!"},
            format="json"
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_healthcheck_endpoint(self):
        res = self.client.get("/api/health/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "healthy")
        self.assertEqual(res.data["database"], "ok")
