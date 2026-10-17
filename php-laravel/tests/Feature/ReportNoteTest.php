<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ReportNoteTest extends TestCase
{
    public function test_guest_redirected_to_login(): void
    {
        $this->get('/notes')->assertRedirect('/login');
        $this->get('/notes/1')->assertRedirect('/login');
        $this->post('/notes', [])->assertRedirect('/login');
        $this->delete('/notes/1')->assertRedirect('/login');
    }

    public function test_authenticated_user_sees_only_own_notes(): void
    {
        $me = DB::table('report_users')->insertGetId([
            'name' => 'Owner', 'email' => 'owner@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $other = DB::table('report_users')->insertGetId([
            'name' => 'Other', 'email' => 'other@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('report_notes')->insert([
            'user_id' => $me, 'project_id' => 'p1', 'title' => 'My note', 'body' => encrypt('body'),
            'attachment_path' => null, 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('report_notes')->insert([
            'user_id' => $other, 'project_id' => 'p2', 'title' => 'Their note', 'body' => encrypt('body'),
            'attachment_path' => null, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->actingAsSessionUser($me)->get('/notes');
        $response->assertStatus(200);
        $response->assertSee('My note');
        $response->assertDontSee('Their note');
    }

    public function test_user_cannot_access_another_users_note(): void
    {
        $me = DB::table('report_users')->insertGetId([
            'name' => 'Owner', 'email' => 'owner@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $other = DB::table('report_users')->insertGetId([
            'name' => 'Other', 'email' => 'other@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $noteId = DB::table('report_notes')->insertGetId([
            'user_id' => $other, 'project_id' => 'p2', 'title' => 'Their note', 'body' => encrypt('body'),
            'attachment_path' => null, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->actingAsSessionUser($me)->get("/notes/{$noteId}")->assertStatus(403);
        $this->actingAsSessionUser($me)->delete("/notes/{$noteId}")->assertStatus(403);
        $this->actingAsSessionUser($me)->get("/notes/{$noteId}/download")->assertStatus(403);
        $this->actingAsSessionUser($me)->put("/notes/{$noteId}", ['title' => 'x'])->assertStatus(403);
    }

    public function test_invalid_upload_rejected(): void
    {
        $me = DB::table('report_users')->insertGetId([
            'name' => 'Owner', 'email' => 'owner@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->actingAsSessionUser($me)->post('/notes', [
            'project_id' => 'p1', 'title' => 't', 'body' => 'b',
            'attachment' => \Illuminate\Http\UploadedFile::fake()->create('evil.exe', 10)->withMimeType('application/x-msdownload'),
        ])->assertSessionHasErrors('attachment');
    }

    public function test_password_is_hashed_never_plaintext(): void
    {
        $id = DB::table('report_users')->insertGetId([
            'name' => 'User', 'email' => 'u@example.test',
            'password_hash' => Hash::make('secret12345'), 'role' => 'manager',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $row = DB::table('report_users')->where('id', $id)->first();
        $this->assertTrue(Hash::check('secret12345', $row->password_hash));
        $this->assertNotSame('secret12345', $row->password_hash);
    }

    protected function actingAsSessionUser(int $userId)
    {
        $this->withSession(['user' => ['id' => $userId, 'name' => 'Owner', 'email' => 'owner@example.test', 'role' => 'manager'], 'authenticated' => true]);
        return $this;
    }
}
